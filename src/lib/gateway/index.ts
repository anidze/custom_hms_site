/**
 * Payment gateway abstraction.
 *
 * The HMS currently records every payment manually (cash drawer, terminal
 * receipt, bank transfer, etc.). This module is the seam where a real
 * processor — TBC e-Commerce, Bank of Georgia, or Stripe — plugs in.
 *
 * To keep the existing manual flow untouched, the active provider is chosen
 * by the `PAYMENT_GATEWAY` env var. Unset or "stub" means we hand back a
 * deterministic fake response and the HMS continues to behave as before;
 * any production provider name without credentials returns a clear error
 * so the UI can surface "not configured" instead of silently failing.
 */
export interface AuthorizeRequest {
  amount: number;
  currency: string;
  description?: string;
  customer?: { name?: string; email?: string };
  card?: { last4?: string; token?: string };
}

export interface GatewayResponse {
  success: boolean;
  providerRef?: string;   // gateway transaction id
  approvalCode?: string;  // bank approval code shown on receipts
  cardLast4?: string;
  raw?: unknown;          // full provider response (stored on the row)
  error?: string;
}

export interface PaymentProvider {
  readonly name: string;
  readonly configured: boolean;
  authorize(req: AuthorizeRequest): Promise<GatewayResponse>;
  capture(providerRef: string, amount?: number): Promise<GatewayResponse>;
  release(providerRef: string): Promise<GatewayResponse>;
  charge(req: AuthorizeRequest): Promise<GatewayResponse>;
  refund(providerRef: string, amount: number, reason?: string): Promise<GatewayResponse>;
}

// ── Stub provider ──────────────────────────────────────────────────────────
// Generates deterministic-but-unique fake refs so dev/test runs are reproducible
// enough to debug, and surfaces a "STUB" prefix so nobody confuses these with
// real transactions.
function rand(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

const stub: PaymentProvider = {
  name: "stub",
  configured: true,
  async authorize(req) {
    return {
      success: true,
      providerRef:  rand("STUB-AUTH"),
      approvalCode: rand("OK").slice(0, 8),
      cardLast4:    req.card?.last4 ?? "0000",
      raw: { stub: true, op: "authorize", req },
    };
  },
  async capture(providerRef, amount) {
    return {
      success: true,
      providerRef,
      approvalCode: rand("CAP").slice(0, 8),
      raw: { stub: true, op: "capture", providerRef, amount },
    };
  },
  async release(providerRef) {
    return {
      success: true,
      providerRef,
      raw: { stub: true, op: "release", providerRef },
    };
  },
  async charge(req) {
    return {
      success: true,
      providerRef:  rand("STUB-CHG"),
      approvalCode: rand("CHG").slice(0, 8),
      cardLast4:    req.card?.last4 ?? "0000",
      raw: { stub: true, op: "charge", req },
    };
  },
  async refund(providerRef, amount, reason) {
    return {
      success: true,
      providerRef:  rand("STUB-RFD"),
      raw: { stub: true, op: "refund", originalRef: providerRef, amount, reason },
    };
  },
};

// ── "Not configured" provider ──────────────────────────────────────────────
// Real providers slot in here. Until credentials are wired up they all return
// a clear error rather than throwing so the UI can render a useful message.
function notConfigured(name: string): PaymentProvider {
  const fail = async (): Promise<GatewayResponse> => ({
    success: false,
    error: `Payment gateway '${name}' is selected but has no credentials configured. Set the matching env vars to enable it.`,
  });
  return {
    name,
    configured: false,
    authorize: fail,
    capture:   fail,
    release:   fail,
    charge:    fail,
    refund:    fail,
  };
}

// ── Factory ────────────────────────────────────────────────────────────────
let cached: PaymentProvider | null = null;
export function getGateway(): PaymentProvider {
  if (cached) return cached;
  const choice = (process.env.PAYMENT_GATEWAY ?? "stub").toLowerCase();
  switch (choice) {
    case "":
    case "stub":
    case "none":
      cached = stub;
      break;
    case "tbc":
    case "bog":
    case "stripe":
      cached = notConfigured(choice);
      break;
    default:
      cached = notConfigured(choice);
  }
  return cached;
}

// Test/clear helper for unit tests; not used in production code paths.
export function _resetGatewayCache() { cached = null; }

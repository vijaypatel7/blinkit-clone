import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useCheckoutMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
} from "../../store/api.js";
import { selectCartItems, selectCartTotals } from "../../store/cartSlice.js";
import { CartSummary } from "../../components/cart/CartSummary.jsx";
import { Button } from "../../components/common/Button.jsx";
import { FullScreenLoader } from "../../components/common/FullScreenLoader.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../app/providers/ToastProvider.jsx";
import { useCart } from "../../hooks/useCart.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { formatPaise } from "../../utils/index.js";

// Only the mandatory fields (name, phone, street, city, state, pincode).
// Everything else (type, label, flat, building, landmark, coordinates) is
// optional on the backend and left to its default.
const EMPTY_FORM = {
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

/** Load the Razorpay checkout.js script on demand (not bundled). */
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

/**
 * CheckoutPage — redesigned checkout with:
 *  - a list of saved addresses (selectable) + an "add new address" form,
 *  - COD vs "Pay Online" (Razorpay),
 *  - order summary sidebar.
 * Requires login; sends the client cart `items` to the backend.
 */
export function CheckoutPage() {
  const { user } = useSelector((state) => state.auth);
  const { lat, lng } = useSelector((state) => state.location);
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clear: clearCart } = useCart();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: addresses, isLoading: loadingAddr } = useGetAddressesQuery(
    undefined,
    { skip: !user },
  );
  const [createAddress] = useCreateAddressMutation();
  const [checkout, { isLoading: placing }] = useCheckoutMutation();
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingAddress, setSavingAddress] = useState(false);

  // Auto-select the default (first) address once loaded.
  useEffect(() => {
    if (addresses?.length && !addressId) {
      setAddressId((addresses.find((a) => a.isDefault) || addresses[0]).id);
    }
  }, [addresses, addressId]);

  if (!user) {
    return (
      <div className="container">
        <EmptyState
          icon="🔐"
          title="Login required"
          subtitle="Please log in to continue to checkout."
          action={
            <Link to={`/login?redirect=/checkout`}>
              <Button variant="green">Login</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Add products before checking out."
          action={
            <Link to="/">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveAddress = async () => {
    if (
      !form.name ||
      !form.phone ||
      !form.street ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      toast(
        "Please fill all required fields (name, phone, street, city, state, pincode).",
        { type: "error" },
      );
      return;
    }
    setSavingAddress(true);
    try {
      const res = await createAddress({
        ...form,
        phone: /^\+91/.test(form.phone) ? form.phone : `+91${form.phone}`,
        // Use the user's chosen delivery location as coordinates when available.
        ...(lat != null && lng != null ? { coordinates: [lng, lat] } : {}),
      }).unwrap();
      setAddressId(res.id);
      setForm(EMPTY_FORM);
      setShowAddressForm(false);
      toast("Address saved", { type: "success" });
    } catch (e) {
      toast(
        e?.data?.message || e?.data?.error?.message || "Failed to save address",
        { type: "error" },
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const openRazorpay = async (order) => {
    const intent = await initiatePayment({
      orderId: order.orderId,
      method: "ONLINE",
    }).unwrap();
    const Razorpay = await loadRazorpay();

    const rzp = new Razorpay({
      key: intent.keyId,
      amount: intent.amount,
      currency: intent.currency,
      order_id: intent.razorpayOrderId,
      name: "blinkit clone",
      description: `Order ${intent.orderNumber}`,
      prefill: {
        name: user?.name || "Customer",
        contact: user?.phone?.replace("+91", ""),
      },
      theme: { color: "#0c831f" },
      handler: async (response) => {
        try {
          await verifyPayment({
            orderId: order.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }).unwrap();
          clearCart();
          toast("Payment successful!", { type: "success" });
          navigate(`/orders/${order.orderId}`);
        } catch (e) {
          toast("Payment verification failed", { type: "error" });
          navigate(`/orders/${order.orderId}`);
        }
      },
      modal: {
        ondismiss: () => toast("Payment cancelled", { type: "info" }),
      },
    });
    rzp.open();
  };

  const placeOrder = async () => {
    if (!addressId) {
      toast("Please select or add a delivery address.", { type: "error" });
      return;
    }
    const payload = {
      addressId,
      paymentMethod,
      notes,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };
    try {
      const order = await checkout(payload).unwrap();
      if (paymentMethod === "ONLINE") {
        await openRazorpay(order);
      } else {
        clearCart();
        toast("Order placed successfully!", { type: "success" });
        navigate(`/orders/${order.orderId}`);
      }
    } catch (err) {
      toast(
        err?.data?.message || err?.data?.error?.message || "Checkout failed",
        { type: "error" },
      );
    }
  };

  if (loadingAddr) return <FullScreenLoader />;

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Checkout</h1>
      <p className="muted" style={{ fontSize: 13, margin: "0 0 20px" }}>
        Delivery in 12 minutes · Free delivery above ₹199
      </p>

      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 340px",
        }}
      >
        <div style={styles.main}>
          {/* -------- Address -------- */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <h3 style={{ margin: 0 }}>📍 Delivery address</h3>
              <Button
                size="sm"
                variant={showAddressForm ? "outline" : "green"}
                onClick={() => setShowAddressForm((s) => !s)}
              >
                {showAddressForm ? "Cancel" : "+ Add new address"}
              </Button>
            </div>

            {showAddressForm && (
              <div style={styles.addressForm}>
                <div
                  style={{
                    ...styles.formRow,
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  }}
                >
                  <input
                    placeholder="Full name *"
                    value={form.name}
                    onChange={set("name")}
                    style={styles.input}
                  />
                  <input
                    placeholder="Phone *"
                    value={form.phone}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setForm((prev) => ({ ...prev, phone: value }));
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    style={styles.input}
                  />
                </div>
                <input
                  placeholder="Street / Area *"
                  value={form.street}
                  onChange={set("street")}
                  style={styles.inputFull}
                />
                <div
                  style={{
                    ...styles.formRow,
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  }}
                >
                  <input
                    placeholder="City *"
                    value={form.city}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setForm((prev) => ({ ...prev, city: value }));
                    }}
                    style={styles.input}
                  />
                  <input
                    placeholder="State *"
                    value={form.state}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\p{L}\s]/gu, "");
                      setForm((prev) => ({ ...prev, state: value }));
                    }}
                    style={styles.input}
                  />
                </div>
                <input
                  placeholder="Pincode *"
                  value={form.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm((prev) => ({ ...prev, pincode: value }));
                  }}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  style={styles.inputFull}
                />
                <Button
                  variant="green"
                  onClick={saveAddress}
                  disabled={savingAddress}
                >
                  {savingAddress ? "Saving…" : "Save address"}
                </Button>
              </div>
            )}

            {!addresses?.length && !showAddressForm && (
              <p className="muted" style={{ margin: "12px 0 0" }}>
                No saved address yet — tap “+ Add new address” to add one.
              </p>
            )}

            {addresses?.map((a) => (
              <label
                key={a.id}
                style={{
                  ...styles.addrCard,
                  ...(addressId === a.id ? styles.addrSelected : {}),
                }}
              >
                <input
                  type="radio"
                  name="address"
                  checked={addressId === a.id}
                  onChange={() => setAddressId(a.id)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ flex: 1 }}>
                  <span style={styles.addrTitle}>
                    🏠 {a.name}
                    {a.isDefault && <span style={styles.badge}>Default</span>}
                  </span>
                  <span style={styles.addrDetail}>
                    {[a.street, a.city, a.state].filter(Boolean).join(", ")} —{" "}
                    {a.pincode}
                  </span>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {a.phone}
                  </span>
                </span>
              </label>
            ))}
          </section>

          {/* -------- Payment -------- */}
          <section style={styles.section}>
            <h3 style={{ margin: "0 0 12px" }}>💳 Payment method</h3>

            <label
              style={{
                ...styles.payOption,
                ...(paymentMethod === "COD" ? styles.paySelected : {}),
              }}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span style={{ fontSize: 22 }}>💵</span>
              <span style={{ flex: 1 }}>
                <strong>Cash on Delivery</strong>
                <span
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  Pay when your order arrives
                </span>
              </span>
            </label>

            <label
              style={{
                ...styles.payOption,
                ...(paymentMethod === "ONLINE" ? styles.paySelected : {}),
              }}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />
              <span style={{ fontSize: 22 }}>💳</span>
              <span style={{ flex: 1 }}>
                <strong>Pay Online</strong>
                <span
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  UPI, cards, netbanking & wallets via Razorpay
                </span>
              </span>
            </label>
          </section>

          {/* -------- Notes -------- */}
          <section style={styles.section}>
            <h3 style={{ margin: "0 0 12px" }}>📝 Delivery notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. leave at the door, call on arrival…"
              style={styles.textarea}
            />
          </section>
        </div>

        {/* -------- Summary -------- */}
        <div
          style={{
            ...styles.sidebar,
            position: isMobile ? "static" : "sticky",
          }}
        >
          <CartSummary totals={totals} />
          <Button
            fullWidth
            size="lg"
            variant="green"
            onClick={placeOrder}
            disabled={placing}
            style={{ marginTop: 12 }}
          >
            {placing
              ? "Placing order…"
              : paymentMethod === "ONLINE"
                ? `Pay ${formatPaise(totals.grandTotal)} & Place Order`
                : "Place Order"}
          </Button>
          <p
            className="muted"
            style={{ fontSize: 11, textAlign: "center", marginTop: 10 }}
          >
            By placing this order you agree to our terms.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: 20,
    alignItems: "start",
  },
  main: { display: "flex", flexDirection: "column", gap: 16 },
  section: {
    background: "#fff",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 18,
    boxShadow: "var(--shadow-sm)",
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  addrCard: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "12px",
    border: "1px solid var(--border)",
    borderRadius: 10,
    marginBottom: 10,
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  addrSelected: { borderColor: "var(--green)", background: "#f4fbf5" },
  addrTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 700,
    fontSize: 14,
  },
  addrDetail: {
    display: "block",
    fontSize: 13,
    color: "var(--text-muted)",
    margin: "3px 0",
  },
  badge: {
    background: "var(--lime)",
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 5,
  },

  addressForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "var(--bg-soft)",
    border: "1px dashed var(--border-strong)",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-strong)",
    fontSize: 14,
    background: "#fff",
  },
  inputFull: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-strong)",
    fontSize: 14,
    background: "#fff",
  },

  payOption: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "12px",
    border: "1px solid var(--border)",
    borderRadius: 10,
    marginBottom: 10,
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  paySelected: { borderColor: "var(--green)", background: "#f4fbf5" },

  textarea: {
    width: "100%",
    minHeight: 76,
    borderRadius: 10,
    border: "1px solid var(--border-strong)",
    padding: 10,
    fontSize: 14,
    resize: "vertical",
    fontFamily: "inherit",
  },
  sidebar: { position: "sticky", top: 140 },
};

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSendOtpMutation, useVerifyOtpMutation } from '../../store/api.js';
import { setSession } from '../../store/authSlice.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';
import { Button } from '../../components/common/Button.jsx';

/**
 * LoginPage — OTP login.
 * The backend sends a REAL SMS to the entered number (Fast2SMS). This page only
 * collects the number + OTP; no demo/fallback OTP is shown to the user.
 */
export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  const validPhone = /^\d{10}$/.test(phone);

  const handleSend = async () => {
    if (!validPhone) {
      toast('Enter a valid 10-digit mobile number.', { type: 'error' });
      return;
    }
    try {
      await sendOtp({ phone: `+91${phone}` }).unwrap();
      toast(`OTP sent to +91 ${phone}`, { type: 'success' });
      setStep('otp');
    } catch (err) {
      toast(err?.data?.message || 'Failed to send OTP', { type: 'error' });
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) {
      toast('Enter the OTP.', { type: 'error' });
      return;
    }
    try {
      const res = await verifyOtp({ phone: `+91${phone}`, otp }).unwrap();
      dispatch(setSession({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast('Logged in successfully!', { type: 'success' });
      navigate(redirect, { replace: true });
    } catch (err) {
      toast(err?.data?.message || 'Invalid OTP', { type: 'error' });
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 40 }}>
      <div style={styles.card}>
        <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>Login / Sign up</h1>
        <p className="muted" style={{ fontSize: 14, margin: '0 0 20px' }}>
          We'll send a one-time password to your phone.
        </p>

        {step === 'phone' ? (
          <>
            <label style={styles.label}>Mobile number</label>
            <div style={styles.phoneRow}>
              <span style={styles.country}>+91</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                style={styles.input}
              />
            </div>
            <Button fullWidth size="lg" variant="green" onClick={handleSend} disabled={!validPhone || sending} style={{ marginTop: 16 }}>
              {sending ? 'Sending OTP…' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <label style={styles.label}>Enter OTP sent to +91 {phone}</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="4–6 digit OTP"
              inputMode="numeric"
              style={{ ...styles.input, letterSpacing: 1, fontSize: 12, textAlign: 'center' }}
            />
            <Button fullWidth size="lg" variant="green" onClick={handleVerify} disabled={verifying} style={{ marginTop: 16 }}>
              {verifying ? 'Verifying…' : 'Verify & Login'}
            </Button>
            <button style={styles.backBtn} onClick={() => setStep('phone')}>← Change number</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 28 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 },
  phoneRow: { display: 'flex', gap: 10 },
  country: {
    display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 10,
    border: '1px solid var(--border-strong)', fontWeight: 700, fontSize: 14,
  },
  input: {
    flex: 1, padding: '13px 14px', borderRadius: 10, border: '1px solid var(--border-strong)', fontSize: 16,
  },
  backBtn: { marginTop: 12, border: 'none', background: 'none', color: 'var(--green)', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
};

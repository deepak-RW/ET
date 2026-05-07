"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Eye, EyeOff, Trash2, Wallet, 
  Loader2, Banknote, ArrowRightLeft, 
  TrainFront, CreditCard, LogOut
} from 'lucide-react';

export default function Home() {
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  // Auth States
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Transaction States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [accountSource, setAccountSource] = useState('bank'); 
  const [showBalances, setShowBalances] = useState(true);

  // Transfer States
  const [transferAmount, setTransferAmount] = useState('');

  // Convex Hooks
  const transactions = useQuery(api.transactions.getTransactions) || [];
  const profiles = useQuery(api.profiles.getUserProfile); 
  
  const addTxMutation = useMutation(api.transactions.addTransaction);
  const deleteTxMutation = useMutation(api.transactions.deleteTransaction);

  // Validation
  const isEntryInvalid = !description.trim() || !amount || parseFloat(amount) <= 0;
  const isTransferInvalid = !transferAmount || parseFloat(transferAmount) <= 0;

  const getBalance = (source: string) => {
    const initial = (profiles as any)?.[`${source}Balance`] || 0;
    const income = transactions
      .filter(t => t.type === 'income' && t.source === source)
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const expense = transactions
      .filter(t => t.type === 'expense' && t.source === source)
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    return initial + income - expense;
  };

  const handleAddTransaction = async () => {
    if (isEntryInvalid) return;
    await addTxMutation({
      description: description.trim(),
      amount: parseFloat(amount),
      type: transactionType,
      source: accountSource
    });
    setDescription(''); setAmount('');
  };

  const handleTransfer = async () => {
    if (isTransferInvalid) return;
    const amt = parseFloat(transferAmount);
    await addTxMutation({ description: "Transfer to Bank", amount: amt, type: "expense", source: "cash" });
    await addTxMutation({ description: "Received from Cash", amount: amt, type: "income", source: "bank" });
    setTransferAmount('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      isSignup ? await signIn("password", { email, password, flow: "signUp" }) : await signIn("password", { email, password, flow: "signIn" });
    } catch (error: any) { alert(error.message); } finally { setAuthLoading(false); }
  };

  if (user === undefined) return <div className="loader-container"><Loader2 className="spin" size={40} /></div>;

  if (user === null) {
    return (
      <div className="login-page-wrapper">
        <div className="login-box">
          <div className="auth-header">
            <div className="logo-box"><Wallet color="white" size={34} /></div>
            <h2>PocketGuard</h2>
          </div>
          <form className="auth-form" onSubmit={handleAuth}>
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
            </div>
            <button type="submit" className="auth-btn">{isSignup ? 'Create Account' : 'Sign In'}</button>
          </form>
          <p className="auth-toggle-text" onClick={() => setIsSignup(!isSignup)}>{isSignup ? "Login" : "Sign Up"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <header className="main-header">
          <div className="brand">
            <div className="logo-small"><Wallet color="white" size={20} /></div>
            <h3>PocketGuard</h3>
          </div>
          <div className="user-controls">
             <button className="eye-toggle-main" onClick={() => setShowBalances(!showBalances)}>
                {showBalances ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
             <button className="logout-link" onClick={() => signOut()}><LogOut size={16} /> LOGOUT</button>
          </div>
        </header>

        <div className="account-grid">
          <div className="acc-card bank">
            <div className="acc-info"><CreditCard size={18} /> <span>Bank</span></div>
            <h2>{showBalances ? `₹${getBalance('bank').toLocaleString()}` : '₹ •••••'}</h2>
          </div>
          <div className="acc-card cash">
            <div className="acc-info"><Banknote size={18} /> <span>Cash</span></div>
            <h2>{showBalances ? `₹${getBalance('cash').toLocaleString()}` : '₹ •••••'}</h2>
          </div>
          <div className="acc-card metro">
            <div className="acc-info"><TrainFront size={18} /> <span>Metro</span></div>
            <h2>{showBalances ? `₹${getBalance('metro').toLocaleString()}` : '₹ •••••'}</h2>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-left">
            <div className="transfer-box card">
              <div className="card-head">
                <ArrowRightLeft size={18} style={{color: '#f59e0b'}} />
                <h4>Quick Transfer</h4>
              </div>
              <p className="subtext">Move physical Cash to Digital Bank</p>
              <div className="transfer-form">
                <input type="number" placeholder="₹ Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                <button onClick={handleTransfer} className="transfer-btn" disabled={isTransferInvalid}>Send to Bank</button>
              </div>
            </div>

            <div className="card add-card">
              <h4>Add Transaction</h4>
              <div className="account-selector">
                {['bank', 'cash', 'metro'].map(s => (
                  <button key={s} className={accountSource === s ? 'active' : ''} onClick={() => setAccountSource(s)}>{s.toUpperCase()}</button>
                ))}
              </div>
              <div className="type-toggle">
                <button className={transactionType === 'income' ? 'active inc' : ''} onClick={() => setTransactionType('income')}>Income</button>
                <button className={transactionType === 'expense' ? 'active exp' : ''} onClick={() => setTransactionType('expense')}>Expense</button>
              </div>
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <input type="number" placeholder="₹ Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <button className={`add-btn ${transactionType}`} onClick={handleAddTransaction} disabled={isEntryInvalid}>
                {isEntryInvalid ? "Enter Details..." : `Confirm ${transactionType}`}
              </button>
            </div>
          </div>

          <div className="dashboard-right">
            <div className="card history-card">
              <h4>Activity History</h4>
              <div className="transaction-list">
                {transactions.map((t: any) => (
                  <div key={t._id} className="t-row">
                    <div className="t-main">
                      <div className="t-icon">
                        {t.source === 'cash' ? <Banknote size={14} /> : t.source === 'metro' ? <TrainFront size={14} /> : <CreditCard size={14} />}
                      </div>
                      <div>
                        <span className="t-desc">{t.description || "No Description"}</span>
                        <div className="t-meta">
                           <small className="t-source-tag">{t.source || 'bank'}</small>
                           <small className="t-date">{new Date(t._creationTime).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                    <div className="t-amt-group">
                      <span className={`t-amt ${t.type}`}>{t.type === 'income' ? '+' : '-'}₹{t.amount}</span>
                      <Trash2 size={16} className="del-icon" onClick={() => deleteTxMutation({ id: t._id })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
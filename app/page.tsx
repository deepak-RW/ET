"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Eye, EyeOff, Trash2, Wallet, TrendingUp,
  TrendingDown, Loader2, Banknote, Coins, DollarSign, Pencil, Check, X, History
} from 'lucide-react';

export default function Home() {
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [showBudget, setShowBudget] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [showBalance, setShowBalance] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmt, setEditAmt] = useState('');
  const [editType, setEditType] = useState('expense');

  // Convex Queries and Mutations
  const transactions = useQuery(api.transactions.getTransactions) || [];
  const initialBudget = useQuery(api.profiles.getStartingBalance) || 0;

  const addTxMutation = useMutation(api.transactions.addTransaction);
  const editTxMutation = useMutation(api.transactions.editTransaction);
  const deleteTxMutation = useMutation(api.transactions.deleteTransaction);
  const updateBudgetMutation = useMutation(api.profiles.updateStartingBalance);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignup) {
        await signIn("password", { email, password, flow: "signUp" });
      } else {
        await signIn("password", { email, password, flow: "signIn" });
      }
    } catch (error: any) {
      alert("Authentication failed: " + (error.message || "Invalid credentials"));
    } finally {
      setAuthLoading(false);
    }
  };

  const updateBudgetInDB = async (val: string) => {
    const num = val === '' ? 0 : parseFloat(val);
    await updateBudgetMutation({ balance: num });
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!description || !amount || numericAmount <= 0) return;
    
    await addTxMutation({
      description,
      amount: numericAmount,
      type: transactionType
    });
    
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = async (id: any) => {
    await deleteTxMutation({ id });
  };

  const startEdit = (t: any) => {
    setEditingId(t._id);
    setEditDesc(t.description);
    setEditAmt(t.amount.toString());
    setEditType(t.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: any) => {
    try {
      await editTxMutation({
        id,
        description: editDesc,
        amount: parseFloat(editAmt),
        type: editType
      });
      setEditingId(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const currentBalance = initialBudget + totalIncome - totalExpenses;

  const FloatingBG = () => (
    <div className="bg-decor">
      <Banknote className="floating-symbol" size={50} style={{ left: '5%', animationDelay: '0s' }} />
      <Coins className="floating-symbol" size={35} style={{ left: '20%', animationDelay: '4s' }} />
      <DollarSign className="floating-symbol" size={45} style={{ left: '40%', animationDelay: '7s' }} />
      <Banknote className="floating-symbol" size={55} style={{ left: '60%', animationDelay: '2s' }} />
      <Coins className="floating-symbol" size={30} style={{ left: '80%', animationDelay: '5s' }} />
      <DollarSign className="floating-symbol" size={40} style={{ left: '95%', animationDelay: '9s' }} />
    </div>
  );

  if (user === undefined) return <div className="loader-container"><Loader2 className="spin" size={40} /></div>;

  if (user === null) {
    return (
      <div className="login-page-wrapper">
        <FloatingBG />
        <div className="login-box">
          <div className="auth-header">
            <div className="logo-box"><Wallet color="white" size={34} /></div>
            <h2>PocketGuard</h2>
            <p>{isSignup ? 'Create your secure account' : 'Sign in to your wallet'}</p>
          </div>
          <form className="auth-form" onSubmit={handleAuth}>
            <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <button type="submit" className="auth-btn" disabled={authLoading}>
              {authLoading ? <Loader2 className="spin" size={20} /> : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          <p className="auth-toggle-text">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span className="auth-link" onClick={() => setIsSignup(!isSignup)}>{isSignup ? 'Login' : 'Sign Up'}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <FloatingBG />
      <div className="dashboard-container">
        <header className="main-header">
          <div className="brand">
            <div className="logo-small"><Wallet color="white" size={24} /></div>
            <h3>PocketGuard</h3>
          </div>
          <div className="user-info">
            <span className="user-email">{user.email || "User"}</span>
            <button className="logout-link" onClick={() => signOut()}>LOGOUT</button>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="dashboard-left">
            <div className="budget-setup-card">
              <label>WALLET STARTING BALANCE</label>
              <div className="budget-input-wrapper">
                <input
                  type={showBudget ? 'number' : 'password'}
                  className="budget-input-simple"
                  value={initialBudget === 0 ? '' : initialBudget}
                  onChange={(e) => updateBudgetInDB(e.target.value)}
                  placeholder="0.00"
                />
                <span className="eye-icon-budget" onClick={() => setShowBudget(!showBudget)}>
                  {showBudget ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            <div className="balance-card">
              <div className="card-top"><span>Total Balance</span></div>
              <div className="balance-amount-row">
                <h1>{showBalance ? `₹${currentBalance.toLocaleString()}` : '₹ ••••••'}</h1>
                <span onClick={() => setShowBalance(!showBalance)} style={{ cursor: 'pointer' }}>
                  {showBalance ? <EyeOff size={22} /> : <Eye size={22} />}
                </span>
              </div>
              <div className="balance-stats">
                <div className="stat inc"><TrendingUp size={18} /> ₹{totalIncome.toLocaleString()}</div>
                <div className="stat exp"><TrendingDown size={18} /> ₹{totalExpenses.toLocaleString()}</div>
              </div>
            </div>

            <div className="card add-card">
              <h4>Add Transaction</h4>
              <form onSubmit={addTransaction}>
                <div className="type-toggle">
                  <button type="button" className={transactionType === 'income' ? 'active inc' : ''} onClick={() => setTransactionType('income')}>Income</button>
                  <button type="button" className={transactionType === 'expense' ? 'active exp' : ''} onClick={() => setTransactionType('expense')}>Expense</button>
                </div>
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="number" step="0.01" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <button className={`add-btn ${transactionType}`}>Confirm {transactionType}</button>
              </form>
            </div>
          </div>

          <div className="dashboard-right">
            <div className="card history-card">
              <h4>Recent Activity</h4>
              <div className="transaction-list">
                {transactions.length === 0 ? (
                  <p className="empty-msg">No history found.</p>
                ) : (
                  transactions.map((t: any) => (
                    <div key={t._id} className={`t-row ${t.type} ${editingId === t._id ? 'editing-row' : ''}`}>
                      {editingId === t._id ? (
                        <div className="edit-mode-container">
                          <div className="edit-inputs">
                            <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                            <input type="number" value={editAmt} onChange={(e) => setEditAmt(e.target.value)} />
                            <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          </div>
                          <div className="edit-actions">
                            <Check size={20} className="save-icon" onClick={() => saveEdit(t._id)} />
                            <X size={20} className="cancel-icon" onClick={cancelEdit} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="t-info">
                            <span className="t-desc">{t.description}</span>
                            <small className="t-date-row">
                              {t._creationTime ? new Date(t._creationTime).toLocaleDateString() : 'Just now'}
                              {t.updatedAt && (
                                <span className="edited-badge" title="Edited">
                                  <History size={12} />
                                </span>
                              )}
                            </small>
                          </div>
                          <div className="t-amt-box">
                            <span className="t-amt">
                              {t.type === 'income' ? '+' : '-'} ₹{Number(t.amount).toLocaleString()}
                            </span>
                            <div className="action-group">
                              <Pencil size={18} className="edit-icon" onClick={() => startEdit(t)} />
                              <Trash2 size={18} className="del-icon" onClick={() => deleteTransaction(t._id)} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

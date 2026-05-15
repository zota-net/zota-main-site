'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  RefreshCw,
  Wallet,
  Send,
  PlusCircle,
  CheckCircle,
  XCircle,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { smsService } from '@/lib/api/services/wallet';
import { useUserStore } from '@/lib/store/user-store';
import { toast } from 'sonner';

interface BalanceData {
  balance:         number;
  smsRemaining:    number;
  smsPricePerUnit: number;
  totalSmsSent:    number;
}

interface LogEntry {
  id:          number;
  recipient:   string;
  voucherCode: string;
  cost:        number;
  status:      'sent' | 'failed';
  sentAt:      string;
}

interface TopupEntry {
  id:         number;
  amount:     number;
  smsCredits: number;
  phone:      string;
  provider:   string;
  createdAt:  string;
}

export default function SmsPage() {
  const user = useUserStore((s) => s.user);
  const [balance, setBalance]   = useState<BalanceData | null>(null);
  const [logs, setLogs]         = useState<LogEntry[]>([]);
  const [topups, setTopups]     = useState<TopupEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: '', phone: '', provider: 'MTN_UGANDA' as 'MTN_UGANDA' | 'AIRTEL_UGANDA' });

  const clientId = user?.client_id;

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [balRes, logRes, topRes] = await Promise.allSettled([
        smsService.getBalance(clientId),
        smsService.getLogs(clientId),
        smsService.getTopupHistory(clientId),
      ]);
      if (balRes.status === 'fulfilled')  setBalance(balRes.value ?? null);
      if (logRes.status === 'fulfilled')  setLogs(logRes.value?.logs ?? []);
      if (topRes.status === 'fulfilled')  setTopups(topRes.value?.topups ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const handleTopup = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    if (!form.phone)             { toast.error('Enter your mobile money number'); return; }
    if (!clientId)               return;

    setSubmitting(true);
    try {
      await smsService.topup({
        clientId: Number(clientId),
        amount,
        phone:    form.phone,
        provider: form.provider,
      });
      toast.success('SMS float topped up successfully!');
      setTopupOpen(false);
      setForm({ amount: '', phone: '', provider: 'MTN_UGANDA' });
      load();
    } catch (err: any) {
      toast.error(err?.message ?? 'Top-up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(n);
  const fmtDate = (s: string) => s ? new Date(s).toLocaleString() : '—';

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              SMS Float
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your OTP SMS balance — automatically sent to customers on each purchase
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setTopupOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Top Up Float
            </Button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">Float Balance</p>
                  <Wallet className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold mt-1 text-green-500">
                  {loading ? '...' : fmtCurrency(balance?.balance ?? 0)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">SMS Remaining</p>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold mt-1 text-blue-500">
                  {loading ? '...' : (balance?.smsRemaining ?? 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Sent</p>
                  <Send className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg sm:text-2xl font-bold mt-1">
                  {loading ? '...' : (balance?.totalSmsSent ?? 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">Price / SMS</p>
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold mt-1 text-amber-500">
                  {loading ? '...' : fmtCurrency(balance?.smsPricePerUnit ?? 0)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How it works notice */}
        <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-500">How SMS OTP works</p>
            <p className="text-muted-foreground mt-0.5">
              When a customer purchases a package via mobile money, an SMS with their voucher code is automatically sent to their phone number — branded with your business name. Each SMS deducts {fmtCurrency(balance?.smsPricePerUnit ?? 50)} from your float. Top up your float to keep OTPs flowing.
            </p>
          </div>
        </div>

        {/* Tabs: sent log + topup history */}
        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger value="sent">SMS Sent Log</TabsTrigger>
            <TabsTrigger value="topups">Topup History</TabsTrigger>
          </TabsList>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>OTP Delivery Log</CardTitle>
                <CardDescription>All SMS messages sent to your customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Voucher Code</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                        </TableRow>
                      )}
                      {!loading && logs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No SMS sent yet. Top up your float to enable OTP delivery.
                          </TableCell>
                        </TableRow>
                      )}
                      {logs.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {l.recipient}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{l.voucherCode}</TableCell>
                          <TableCell>{fmtCurrency(Number(l.cost))}</TableCell>
                          <TableCell>
                            <Badge variant={l.status === 'sent' ? 'default' : 'destructive'} className="gap-1">
                              {l.status === 'sent' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {l.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(l.sentAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topups">
            <Card>
              <CardHeader>
                <CardTitle>Topup History</CardTitle>
                <CardDescription>Your SMS float purchase records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>SMS Credits</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                        </TableRow>
                      )}
                      {!loading && topups.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No topups yet.
                          </TableCell>
                        </TableRow>
                      )}
                      {topups.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-semibold text-green-500">{fmtCurrency(Number(t.amount))}</TableCell>
                          <TableCell>{t.smsCredits} SMS</TableCell>
                          <TableCell>{t.phone}</TableCell>
                          <TableCell>{t.provider?.replace('_UGANDA', '')}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Topup Dialog */}
        <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Top Up SMS Float
              </DialogTitle>
              <DialogDescription>
                Pay via mobile money to add SMS credits to your account.
                {balance && ` Current balance: ${fmtCurrency(balance.balance)} (${balance.smsRemaining} SMS remaining)`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Amount (UGX)</Label>
                <Input
                  type="number"
                  min={500}
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
                {form.amount && balance && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {Math.floor(parseFloat(form.amount || '0') / (balance.smsPricePerUnit || 50))} SMS credits
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mobile Money Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+256 XXX XXX XXX"
                    className="pl-9"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v: 'MTN_UGANDA' | 'AIRTEL_UGANDA') => setForm((f) => ({ ...f, provider: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN_UGANDA">MTN Mobile Money</SelectItem>
                    <SelectItem value="AIRTEL_UGANDA">Airtel Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-muted/50 border p-3 text-xs text-muted-foreground">
                Each SMS costs {fmtCurrency(balance?.smsPricePerUnit ?? 50)}. Your voucher OTPs are sent automatically — no manual action needed after topping up.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTopupOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleTopup} disabled={submitting}>
                {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                {submitting ? 'Processing...' : 'Top Up Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

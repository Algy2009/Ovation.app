"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { ShieldCheck, Headset, ShieldAlert, RotateCcw, ArrowUpRight } from "lucide-react";

export default function SuperAdminHome() {
  const { organizers, supportTickets, orders, refundRequests, loading } = useData();

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  const pendingOrganizers = organizers.filter((o) => o.status === "pending").length;
  const openTickets = supportTickets.filter((t) => t.status === "open").length;
  const flaggedOrders = orders.filter((o) => o.flagged && o.status !== "blocked").length;
  const pendingRefunds = refundRequests.filter((r) => r.status === "pending").length;

  const cards = [
    { href: "/superadmin/organizers", label: "Organizer menunggu approval", value: pendingOrganizers, icon: ShieldCheck },
    { href: "/superadmin/support", label: "Tiket customer service terbuka", value: openTickets, icon: Headset },
    { href: "/superadmin/fraud", label: "Transaksi ditandai calo/fraud", value: flaggedOrders, icon: ShieldAlert },
    { href: "/superadmin/refunds", label: "Permintaan refund pending", value: pendingRefunds, icon: RotateCcw },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Ringkasan super admin</h1>
      <p className="mt-1 text-sm text-silver-dim">Hal-hal yang perlu ditindaklanjuti hari ini.</p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {cards.map(({ href, label, value, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start justify-between rounded-lg border border-line bg-panel px-5 py-5 transition-colors hover:bg-panel-raised/60"
          >
            <div>
              <Icon size={18} className="text-gold" />
              <p className="mt-3 font-display text-3xl text-paper">{value}</p>
              <p className="mt-1 text-sm text-silver-dim">{label}</p>
            </div>
            <ArrowUpRight size={16} className="text-silver-dim" />
          </Link>
        ))}
      </div>
    </div>
  );
}

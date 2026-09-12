import React from 'react';
import { prisma } from '@/lib/prisma';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settingsRecords = await prisma.storeSetting.findMany();
  const settingsMap: Record<string, string> = {};
  settingsRecords.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-[#86868b] mt-1">
          Configure store identity, free delivery rules, announcement headlines, and currency formatting.
        </p>
      </div>

      <SettingsForm initialSettings={settingsMap} />
    </div>
  );
}

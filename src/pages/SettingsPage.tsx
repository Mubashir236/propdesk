import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Settings, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const me = useQuery(api.users.getMe);
  const settings = useQuery(api.settings.getSettings);
  const upsertSettings = useMutation(api.settings.upsertSettings);
  const updateProfile = useMutation(api.users.updateProfile);

  const isCeo = me?.role === "ceo";

  // Commission settings form
  const [commForm, setCommForm] = useState({
    commission_rate_sales: "",
    commission_rate_rental: "",
    default_agent_split: "",
    target_monthly_revenue: "",
  });
  const [commSaved, setCommSaved] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setCommForm({
        commission_rate_sales: String(settings.commission_rate_sales),
        commission_rate_rental: String(settings.commission_rate_rental),
        default_agent_split: String(settings.default_agent_split),
        target_monthly_revenue: String(settings.target_monthly_revenue),
      });
    }
  }, [settings]);

  useEffect(() => {
    if (me) {
      setProfileForm({ name: me.name, phone: me.phone });
    }
  }, [me]);

  async function handleSaveSettings() {
    await upsertSettings({
      commission_rate_sales: parseFloat(commForm.commission_rate_sales) || 2,
      commission_rate_rental: parseFloat(commForm.commission_rate_rental) || 5,
      default_agent_split: parseFloat(commForm.default_agent_split) || 50,
      target_monthly_revenue: parseFloat(commForm.target_monthly_revenue) || 0,
    });
    setCommSaved(true);
    setTimeout(() => setCommSaved(false), 2000);
  }

  async function handleSaveProfile() {
    await updateProfile({
      name: profileForm.name,
      phone: profileForm.phone,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2D4A]">Settings</h1>
        <p className="text-sm text-muted-foreground">
          {isCeo ? "Manage company settings and commission rates" : "Manage your profile"}
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#1A2D4A]" />
            <CardTitle className="text-base">Personal Profile</CardTitle>
          </div>
          <CardDescription>Update your name and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+971 50 000 0000"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input value={me?.email ?? ""} disabled className="mt-1 bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">Email is managed by your Clerk account</p>
          </div>
          <div>
            <Label>Role</Label>
            <Input
              value={me?.role?.toUpperCase() ?? ""}
              disabled
              className="mt-1 bg-muted/50 capitalize"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              size="sm"
              className={cn(profileSaved && "bg-emerald-600 hover:bg-emerald-700")}
            >
              {profileSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Saved
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commission Settings (CEO only) */}
      {isCeo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1A2D4A]" />
              <CardTitle className="text-base">Commission Settings</CardTitle>
            </div>
            <CardDescription>
              Configure commission rates and revenue targets for the company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sales Commission Rate (%)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={commForm.commission_rate_sales}
                    onChange={(e) => setCommForm({ ...commForm, commission_rate_sales: e.target.value })}
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Typical: 2% on sale price</p>
              </div>
              <div>
                <Label>Rental Commission Rate (%)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={commForm.commission_rate_rental}
                    onChange={(e) => setCommForm({ ...commForm, commission_rate_rental: e.target.value })}
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Typical: 5% of annual rent</p>
              </div>
              <div>
                <Label>Default Agent Split (%)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={commForm.default_agent_split}
                    onChange={(e) => setCommForm({ ...commForm, default_agent_split: e.target.value })}
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Agent receives this % of total commission</p>
              </div>
              <div>
                <Label>Monthly Revenue Target (AED)</Label>
                <Input
                  type="number"
                  value={commForm.target_monthly_revenue}
                  onChange={(e) => setCommForm({ ...commForm, target_monthly_revenue: e.target.value })}
                  placeholder="500000"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Shown as progress bar in Analytics</p>
              </div>
            </div>

            <Separator />

            {/* Preview calculation */}
            {commForm.commission_rate_sales && (
              <div className="bg-[#1A2D4A]/5 rounded-lg p-3">
                <p className="text-xs font-medium text-[#1A2D4A] mb-2">Example: AED 2,000,000 Sale</p>
                <div className="space-y-1 text-xs">
                  {[
                    { label: "Total Commission", value: ((2000000 * parseFloat(commForm.commission_rate_sales || "0")) / 100) },
                    { label: "Agent Share", value: ((2000000 * parseFloat(commForm.commission_rate_sales || "0") / 100) * parseFloat(commForm.default_agent_split || "0")) / 100 },
                    { label: "Company Share", value: ((2000000 * parseFloat(commForm.commission_rate_sales || "0") / 100) * (100 - parseFloat(commForm.default_agent_split || "0"))) / 100 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">AED {value.toLocaleString("en-AE", { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                size="sm"
                className={cn(commSaved && "bg-emerald-600 hover:bg-emerald-700")}
              >
                {commSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Saved
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent: commission info */}
      {!isCeo && me && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1A2D4A]" />
              <CardTitle className="text-base">My Commission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-[#1A2D4A]/5 rounded-lg">
              <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-[#C9A84C]">%</span>
              </div>
              <div>
                <p className="font-semibold">Your Split: {me.agent_split_pct}%</p>
                <p className="text-xs text-muted-foreground">
                  You receive {me.agent_split_pct}% of the company commission on each deal you close.
                  Contact your CEO to adjust this.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

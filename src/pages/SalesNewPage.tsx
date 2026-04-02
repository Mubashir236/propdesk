import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import PropertyForm, { type SalesFormValues } from "@/components/Listings/PropertyForm";
import { ArrowLeft } from "lucide-react";

export default function SalesNewPage() {
  const navigate = useNavigate();
  const me = useQuery(api.users.getMe);
  const createListing = useMutation(api.sales.createSalesListing);
  const [loading, setLoading] = useState(false);

  // Redirect non-CEO
  if (me && me.role !== "ceo") {
    navigate("/sales", { replace: true });
    return null;
  }

  async function handleSubmit(values: SalesFormValues) {
    setLoading(true);
    try {
      const id = await createListing(values);
      navigate(`/sales/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <button
        onClick={() => navigate("/sales")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sales
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[#1A2D4A]">New Sales Listing</h1>
        <p className="text-sm text-muted-foreground">Create a new property for sale</p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <PropertyForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/sales")}
          loading={loading}
        />
      </div>
    </div>
  );
}

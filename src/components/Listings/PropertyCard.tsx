import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatAED, formatNumber } from "@/lib/utils";
import { Bed, Maximize2, MapPin, Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  refNo: string;
  title: string;
  type: "sale" | "rental";
  propertyType: string;
  bedrooms: string;
  price: number;
  area: number;
  community: string;
  status: string;
  photoUrl?: string;
}

export default function PropertyCard({
  id,
  refNo,
  title,
  type,
  propertyType,
  bedrooms,
  price,
  area,
  community,
  status,
  photoUrl,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const path = type === "sale" ? `/sales/${id}` : `/rentals/${id}`;

  return (
    <div
      onClick={() => navigate(path)}
      className="bg-white border border-border/60 rounded-xl overflow-hidden hover:shadow-md hover:border-[#C9A84C]/30 transition-all cursor-pointer group"
    >
      {/* Photo */}
      <div className="relative h-44 bg-gradient-to-br from-[#1A2D4A]/10 to-[#1A2D4A]/5 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {type === "sale" ? (
              <Building2 className="w-12 h-12 text-[#1A2D4A]/20" />
            ) : (
              <Home className="w-12 h-12 text-[#1A2D4A]/20" />
            )}
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={status} size="sm" />
        </div>
        {/* Ref number */}
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-mono bg-black/40 text-white px-1.5 py-0.5 rounded">
            {refNo}
          </span>
        </div>
        {/* Gold border on hover */}
        <div className="absolute inset-0 ring-inset ring-0 group-hover:ring-2 group-hover:ring-[#C9A84C]/40 rounded-t-xl transition-all" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 mb-0.5 text-[#1A2D4A]">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{propertyType}</p>

        {/* Price */}
        <p className="text-lg font-bold text-[#C9A84C] mb-3 leading-none">
          {formatAED(price)}
          {type === "rental" && (
            <span className="text-xs text-muted-foreground font-normal ml-1">/ yr</span>
          )}
        </p>

        {/* Property details */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {bedrooms && bedrooms !== "Studio" && (
            <div className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              <span>{bedrooms} BR</span>
            </div>
          )}
          {bedrooms === "Studio" && (
            <div className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              <span>Studio</span>
            </div>
          )}
          {area > 0 && (
            <div className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              <span>{formatNumber(area)} sqft</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{community}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

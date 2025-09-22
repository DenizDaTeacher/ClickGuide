import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Globe } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";

export function TenantInfo() {
  const { tenant, loading } = useTenant();

  if (loading) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-muted rounded animate-pulse" />
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tenant) {
    return (
      <Card className="border-l-4 border-l-muted">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Standard Arbeitsbereich
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{tenant.name}</span>
              <div className="flex items-center space-x-2">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {tenant.domain}
                </span>
              </div>
            </div>
          </div>
          <Badge 
            variant={tenant.is_active ? "default" : "secondary"}
            className="text-xs"
          >
            {tenant.is_active ? "Aktiv" : "Inaktiv"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
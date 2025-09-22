import CallDashboard from "@/components/CallDashboard";
import { TenantInfo } from "@/components/TenantInfo";
import { TenantManagement } from "@/components/TenantManagement";

const Index = () => {
  return (
    <div className="space-y-6">
      <TenantInfo />
      <CallDashboard />
      
      {/* Admin-Bereich für Team-Verwaltung */}
      <div className="border-t pt-6">
        <TenantManagement />
      </div>
    </div>
  );
};

export default Index;

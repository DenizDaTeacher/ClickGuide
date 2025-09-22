import CallDashboard from "@/components/CallDashboard";
import { TenantInfo } from "@/components/TenantInfo";

const Index = () => {
  return (
    <div className="space-y-4">
      <TenantInfo />
      <CallDashboard />
    </div>
  );
};

export default Index;

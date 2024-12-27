import { Header } from "@/components/Header";
import { RewardGrid } from "@/components/rewards/RewardGrid";

const RewardManagement = () => {
  return (
    <div className="space-y-8">
      <Header />
      <RewardGrid />
    </div>
  );
};

export default RewardManagement;
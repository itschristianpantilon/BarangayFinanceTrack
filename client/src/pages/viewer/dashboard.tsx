import Header from "../../components/viewer-dashboard/Header";
import Hero from "../../components/viewer-dashboard/sections/Hero";
import FinancialOverview from "../../components/viewer-dashboard/sections/FinancialOverview";
import BudgetBreakdown from "../../components/viewer-dashboard/sections/BudgetBreakdown";
import RevenueExpenditure from "../../components/viewer-dashboard/sections/RevenueExpenditure";
import TransactionRecords from "../../components/viewer-dashboard/sections/TransactionRecords";
import DevelopmentProjects from "../../components/viewer-dashboard/sections/DevelopmentProjects";
import CommunityFeedback from "../../components/viewer-dashboard/sections/CommunityFeedback";
import Footer from "../../components/viewer-dashboard/Footer";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function ViewerDashboard() {
  const currentYear = new Date().getFullYear();

  const {
    // Raw data
    collections,
    disbursements,
    dfurProjects,
    comments,
    // Loading states
    isLoadingCollections,
    isLoadingDisbursements,
    isLoadingBudgetEntries,
    isLoadingDfurProjects,
    isLoadingComments,
    // Actions
    refetchComments,
    // Derived financials
    totalCollections,
    totalDisbursements,
    surplus,
    totalApprovedCost,
    totalIncurredCost,
    utilizationRate,
    // Chart/table data
    budgetAnalysisData,
    aboBreakdownData,
    collectionsPieData,
    disbursementsPieData,
    dfurStatusPieData,
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-white relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

       <Header />

      <main className="w-full relative pt-14 lg:pt-20">
        <div className="w-full">
          <Hero currentYear={currentYear} />
        </div>


        <div className="max-w-7xl mx-auto px-6 py-10 lg:py-16 space-y-10">
          
        <FinancialOverview
          totalCollections={totalCollections}
          totalDisbursements={totalDisbursements}
          surplus={surplus}
          utilizationRate={utilizationRate}
          budgetAnalysisData={budgetAnalysisData}
          isLoadingBudgetEntries={isLoadingBudgetEntries}
          isLoadingDisbursements={isLoadingDisbursements}
        />

        <BudgetBreakdown
          aboBreakdownData={aboBreakdownData}
          isLoadingBudgetEntries={isLoadingBudgetEntries}
          currentYear={currentYear}
        />

        <RevenueExpenditure />

        <TransactionRecords
          collections={collections}
          disbursements={disbursements}
          isLoadingCollections={isLoadingCollections}
          isLoadingDisbursements={isLoadingDisbursements}
        />

        <DevelopmentProjects
          dfurProjects={dfurProjects}
          dfurStatusPieData={dfurStatusPieData}
          totalApprovedCost={totalApprovedCost}
          totalIncurredCost={totalIncurredCost}
          isLoadingDfurProjects={isLoadingDfurProjects}
        />

        <CommunityFeedback
          comments={comments}
          isLoadingComments={isLoadingComments}
          refetchComments={refetchComments}
        />
        </div>
      </main>

      <Footer currentYear={currentYear} />
    </div>
  );
}
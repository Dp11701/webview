type PlanType = string;

interface PlanBoxProps {
  type: PlanType;
  title: string;
  price: string;
  salePrice?: string;
  selectedPlan: PlanType;
  onSelect: any;
}

export const PlanBox: React.FC<PlanBoxProps> = ({
  type,
  title,
  price,
  salePrice,
  selectedPlan,
  onSelect,
}) => {
  return (
    <div
      className={`flex flex-col gap-2 items-center justify-center ${
        selectedPlan === type ? "border-gradient" : "border-gradient-alt"
      } rounded-[16px] p-1 min-w-[40vw] h-auto py-4 cursor-pointer`}
      onClick={() => onSelect(type)}
    >
      <div className="px-4 rounded-lg">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <span className="text-[18px] leading-[28px] font-[600] text-white">
              {title}
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 rounded-lg">
        <div className="flex flex-row gap-1 items-center justify-center px-4">
          <span className="text-white font-[700] text-[18px] leading-[24px]">
            {price}
          </span>
          {salePrice && (
            <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
              {salePrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

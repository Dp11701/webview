import Close from "../assets/icons/Close-no-background.svg";

export default function Store() {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* header */}
      <div className="flex flex-row items-center justify-between px-4 py-4">
        <img src={Close} alt="close" />
        <span className="font-[400] text-[14px] leading-[20px] underline text-[#E2E2E2]">
          Restore
        </span>
      </div>
      {/* title */}
      <div className="flex flex-col items-center px-10 mb-10 w-full">
        <span className="text-[20px] leading-[28px] font-[600] text-center w-[70vw] bg-gradient-to-r from-[#FFEBC3] to-[#CA9834] inline-block text-transparent bg-clip-text">
          Become VIP to Access All Exclusive Benefits
        </span>
      </div>

      {/* subscription */}
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Subscription */}
        <div className="flex flex-row gap-4 px-4 py-4 overflow-x-auto">
          <div
            className="flex flex-col gap-4 border-gradient rounded-[16px] p-1 min-w-[40vw] h-auto"
            // onClick={sendMessageToMobile}
          >
            <div className="px-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Weekly VIP
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 rounded-lg">
              <div className="flex flex-row gap-1 items-center justify-center ">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {/* {weeklyVip?.price_title || "$19.99"} */}
                  $19.99
                </span>
                <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
                  {/* {weeklyVip?.cost_title || "$24.99"} */}
                  $24.99
                </span>
              </div>
            </div>
          </div>
          <div
            className="gap-4 border-gradient-alt rounded-[16px] p-1 min-w-[40vw]"
            // onClick={sendMessageToMobile}
          >
            <div className="px-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-2 items-center">
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Monthly VIP
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 rounded-lg">
              <div className="flex flex-row justify-between gap-1 items-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {/* {monthlyVip?.price_title || "36.99$"} */}
                  36.99$
                </span>
              </div>
            </div>
          </div>
          <div
            className=" gap-4 border-gradient-alt rounded-[16px] p-1 min-w-[40vw]"
            // onClick={sendMessageToMobile}
          >
            <div className="px-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-2 items-center">
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Yearly VIP
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 rounded-lg">
              <div className="flex flex-row justify-between gap-1 items-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {/* {yearlyVip?.price_title || "$249.99"} */}
                  $249.99
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

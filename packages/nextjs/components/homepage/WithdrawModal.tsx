import { Dispatch, SetStateAction, useState } from "react";
import { EtherInput } from "../scaffold-eth";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils.js";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const WithdrawModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("0");

  const { writeAsync: withdraw } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "flowWithdraw",
    args: [amount ? BigNumber.from(parseEther(amount)) : BigNumber.from(parseEther("0")), reason],
  });

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <div className="border-2 rounded-xl overflow-hidden border-black w-fit text-xs bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20">
          <div className=" modal-box">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <label className="block mt-4 mb-2">Amount:</label>
            <EtherInput
              value={amount.toString()}
              onChange={value => setAmount(value)}
              placeholder="Enter withdraw amount"
            />
            <label className="block mt-2 mb-2">Reason:</label>

            <textarea
              className="textarea textarea-bordered  focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[5.2rem] px-4  w-full font-medium placeholder:text-accent/50 text-gray-400 rounded-lg"
              placeholder="Enter Reason"
              onChange={e => setReason(e.target.value)}
            ></textarea>
            <button className="btn btn-primary rounded-lg w-full mt-2 ml-auto" onClick={withdraw}>
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

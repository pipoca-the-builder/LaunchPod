import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { CommonInputProps, InputBase, SIGNED_NUMBER_REGEX } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

const MAX_DECIMALS_USD = 2;
const MAX_DECIMALS_ETH = 10;

function etherValueToDisplayValue(usdMode: boolean, etherValue: string, nativeCurrencyPrice: number) {
  if (usdMode && nativeCurrencyPrice) {
    const parsedEthValue = parseFloat(etherValue);
    if (Number.isNaN(parsedEthValue)) {
      return etherValue;
    } else {
      // We need to round the value rather than use toFixed,
      // since otherwise a user would not be able to modify the decimal value
      return (
        Math.round(parsedEthValue * nativeCurrencyPrice * 10 ** MAX_DECIMALS_USD) /
        10 ** MAX_DECIMALS_USD
      ).toString();
    }
  } else {
    return etherValue;
  }
}

function displayValueToEtherValue(usdMode: boolean, displayValue: string, nativeCurrencyPrice: number) {
  if (usdMode && nativeCurrencyPrice) {
    const parsedDisplayValue = parseFloat(displayValue);
    if (Number.isNaN(parsedDisplayValue)) {
      // Invalid number.
      return displayValue;
    } else {
      // Compute the ETH value if a valid number.
      return (parsedDisplayValue / nativeCurrencyPrice).toFixed(18).toString();
    }
  } else {
    return displayValue.trim() === "." ? "0." : displayValue;
  }
}

/**
 * Input for ETH amount with USD conversion.
 *
 * onChange will always be called with the value in ETH
 */
export const EtherInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps) => {
  const [transitoryDisplayValue, setTransitoryDisplayValue] = useState<string>();
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);
  const [usdMode, setUSDMode] = useState(true);

  // The displayValue is derived from the ether value that is controlled outside of the component
  // In usdMode, it is converted to its usd value, in regular mode it is unaltered
  const displayValue = useMemo(() => {
    const newDisplayValue = etherValueToDisplayValue(usdMode, value, nativeCurrencyPrice);
    if (transitoryDisplayValue && parseFloat(newDisplayValue) === parseFloat(transitoryDisplayValue)) {
      return transitoryDisplayValue;
    }
    // Clear any transitory display values that might be set
    setTransitoryDisplayValue(undefined);
    return newDisplayValue;
  }, [nativeCurrencyPrice, transitoryDisplayValue, usdMode, value]);

  const handleChangeNumber = (newValue: string) => {
    if (newValue && !SIGNED_NUMBER_REGEX.test(newValue)) {
      return;
    }

    // Following condition is a fix to prevent usdMode from experiencing different display values
    // than what the user entered. This can happen due to floating point rounding errors that are introduced in the back and forth conversion
    if (usdMode) {
      if (newValue === ".") {
        newValue = "0.";
      }
      const decimals = newValue.split(".")[1];
      if (decimals && decimals.length > MAX_DECIMALS_USD) {
        return;
      }
    } else {
      const decimals = newValue.split(".")[1];
      if (decimals && decimals.length > MAX_DECIMALS_ETH) {
        return;
      }
    }

    // Since the display value is a derived state (calculated from the ether value), usdMode would not allow introducing a decimal point.
    // This condition handles a transitory state for a display value with a trailing decimal sign
    if (newValue.endsWith(".") || newValue.endsWith(".0")) {
      setTransitoryDisplayValue(newValue);
    } else {
      setTransitoryDisplayValue(undefined);
    }

    const newEthValue = displayValueToEtherValue(usdMode, newValue, nativeCurrencyPrice);
    onChange(newEthValue);
  };

  const toggleMode = () => {
    setUSDMode(!usdMode);
  };

  return (
    <InputBase
      name={name}
      value={displayValue}
      placeholder={placeholder}
      onChange={handleChangeNumber}
      disabled={disabled}
      prefix={
        <span className="pl-4 -mr-2 text-accent self-center">
          {usdMode ? (
            "$"
          ) : (
            <Image
              src="/the-graph-svg.png"
              alt="GRT Token"
              width={16}
              height={16}
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
          )}
        </span>
      }
      suffix={
        <button
          className={`btn btn-primary h-[2.2rem] min-h-[2.2rem] ${nativeCurrencyPrice > 0 ? "" : "hidden"}`}
          onClick={toggleMode}
          disabled={!usdMode && !nativeCurrencyPrice}
        >
          <ArrowsRightLeftIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
        </button>
      }
    />
  );
};

// src/components/mitra-form/FormButton.tsx
interface Props {
  label: string;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean;
}

export default function FormButton({ label, onClick, secondary, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[130px] h-11 px-6 rounded-md font-semibold transition text-sm md:text-base
        ${secondary
          ? "bg-gray-200 text-[#271F01] hover:bg-gray-300"
          : "bg-[#271F01] text-white hover:bg-[#3b2f00]"}
        ${disabled ? "opacity-60 cursor-not-allowed hover:bg-inherit" : ""}`}
    >
      {label}
    </button>
  );
}

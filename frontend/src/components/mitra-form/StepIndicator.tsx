// src/components/mitra-form/StepIndicator.tsx
interface StepIndicatorProps {
  step: number;
}

export default function StepIndicator({ step }: StepIndicatorProps) {
  const steps = ["Identitas", "Fasilitas & Layanan", "Akun"];

  return (
    <div className="flex justify-center items-center mb-12 w-full max-w-xl mx-auto">
      {steps.map((label, i) => {
        const index = i + 1;
        const active = step >= index;

        return (
          <div key={label} className="relative flex flex-col items-center w-full">
            
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold border-2 z-10 transition-all duration-500 ${
                active
                  ? "bg-[#271F01] text-white border-[#271F01] scale-110 shadow-md"
                  : "border-gray-300 text-gray-400 bg-white"
              }`}
            >
              {index}
            </div>
            <p
              className={`mt-2 text-sm transition-colors duration-500 ${
                active ? "text-[#271F01] font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </p>

            {i < steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-[5px] -z-10">
                <div className="relative w-full h-full bg-gray-300">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-700 ease-in-out ${
                      step > index ? "bg-[#271F01] w-full" : "bg-[#271F01] w-0"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

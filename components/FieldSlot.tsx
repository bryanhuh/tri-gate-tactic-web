interface FieldSlotProps {
    onClick?: () => void;
  }
  
  export function FieldSlot({ onClick }: FieldSlotProps) {
    return (
      <div
        onClick={onClick}
        className="w-40 h-60 bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg m-2 flex items-center justify-center cursor-pointer"
      >
        <span className="text-gray-500">Empty Slot</span>
      </div>
    );
  }
  
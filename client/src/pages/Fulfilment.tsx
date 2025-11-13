import { Sidebar } from "@/components/layout/Sidebar";
import InventoryApp from "./fulfilment/InventoryApp";

export default function Fulfilment() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <InventoryApp />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}

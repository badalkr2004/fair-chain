
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MandiPrice {
  name: string;
  tomatoes: number;
  potatoes: number;
  onions: number;
}

interface PriceComparisonProps {
  data: MandiPrice[];
}

export function PriceComparison({ data }: PriceComparisonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mandi</TableHead>
          <TableHead className="text-right">Tomatoes</TableHead>
          <TableHead className="text-right">Potatoes</TableHead>
          <TableHead className="text-right">Onions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((mandi) => (
          <TableRow key={mandi.name}>
            <TableCell className="font-medium">{mandi.name}</TableCell>
            <TableCell className="text-right">₹{mandi.tomatoes}/kg</TableCell>
            <TableCell className="text-right">₹{mandi.potatoes}/kg</TableCell>
            <TableCell className="text-right">₹{mandi.onions}/kg</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

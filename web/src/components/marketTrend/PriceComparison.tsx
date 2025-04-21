import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MandiPrice } from '@/types/market';

interface PriceComparisonProps {
  data: MandiPrice[];
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mandi Price Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mandi</TableHead>
              <TableHead>Price (₹/quintal)</TableHead>
              <TableHead>Distance (km)</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((price, index) => (
              <TableRow key={index}>
                <TableCell>{price.mandi}</TableCell>
                <TableCell>₹{price.price}</TableCell>
                <TableCell>{price.distance} km</TableCell>
                <TableCell>{new Date(price.last_updated).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PriceComparison;

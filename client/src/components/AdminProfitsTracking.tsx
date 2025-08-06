import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, BarChart3, PieChart, DollarSign } from "lucide-react";

export function AdminProfitsTracking() {
  const { data: profits, isLoading: profitsLoading } = useQuery({
    queryKey: ["/api/admin/profits"],
    queryFn: () => apiRequest("GET", "/api/admin/profits").then(res => res.json()),
  });

  const { data: profitsByOperation, isLoading: operationLoading } = useQuery({
    queryKey: ["/api/admin/profits/by-operation"],
    queryFn: () => apiRequest("GET", "/api/admin/profits/by-operation").then(res => res.json()),
  });

  const { data: profitTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/admin/profits/trends"],
    queryFn: () => apiRequest("GET", "/api/admin/profits/trends").then(res => res.json()),
  });

  if (profitsLoading || operationLoading || trendsLoading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProfit = profitsByOperation?.reduce((acc: number, item: any) => acc + Number(item.totalProfit || 0), 0) || 0;
  const totalTransactions = profitsByOperation?.reduce((acc: number, item: any) => acc + Number(item.transactionCount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Statistiques résumées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Total</p>
                <p className="text-2xl font-bold">{totalProfit.toLocaleString()} XOF</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Moyen</p>
                <p className="text-2xl font-bold">
                  {totalTransactions > 0 ? Math.round(totalProfit / totalTransactions).toLocaleString() : 0} XOF
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Types d'Opération</p>
                <p className="text-2xl font-bold">{profitsByOperation?.length || 0}</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profits par type d'opération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Profits par Type d'Opération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type d'Opération</TableHead>
                <TableHead>Profit Total</TableHead>
                <TableHead>Nombre de Transactions</TableHead>
                <TableHead>Marge Moyenne</TableHead>
                <TableHead>Profit Moyen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitsByOperation?.map((operation: any) => (
                <TableRow key={operation.operationType}>
                  <TableCell>
                    <Badge variant="outline">
                      {operation.operationType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {Number(operation.totalProfit || 0).toLocaleString()} XOF
                  </TableCell>
                  <TableCell>{Number(operation.transactionCount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {Number(operation.avgProfitMargin || 0).toFixed(2)}%
                  </TableCell>
                  <TableCell className="font-mono">
                    {operation.transactionCount > 0 
                      ? Math.round(Number(operation.totalProfit || 0) / Number(operation.transactionCount)).toLocaleString()
                      : 0
                    } XOF
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tendances mensuelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendances Mensuelles des Profits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead>Profit Total</TableHead>
                <TableHead>Frais Totaux</TableHead>
                <TableHead>Nombre de Transactions</TableHead>
                <TableHead>Évolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitTrends?.map((trend: any, index: number) => {
                const previousMonth = profitTrends[index + 1];
                const evolution = previousMonth 
                  ? ((Number(trend.totalProfit) - Number(previousMonth.totalProfit)) / Number(previousMonth.totalProfit) * 100)
                  : 0;
                
                return (
                  <TableRow key={trend.month}>
                    <TableCell>
                      {new Date(trend.month).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </TableCell>
                    <TableCell className="font-mono">
                      {Number(trend.totalProfit || 0).toLocaleString()} XOF
                    </TableCell>
                    <TableCell className="font-mono">
                      {Number(trend.totalFees || 0).toLocaleString()} XOF
                    </TableCell>
                    <TableCell>{Number(trend.transactionCount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {index < profitTrends.length - 1 && (
                        <Badge variant={evolution >= 0 ? "default" : "destructive"}>
                          {evolution >= 0 ? "+" : ""}{evolution.toFixed(1)}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Derniers profits détaillés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Derniers Profits Détaillés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type d'Opération</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Montant Brut</TableHead>
                <TableHead>Frais</TableHead>
                <TableHead>Profit Net</TableHead>
                <TableHead>Marge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profits?.slice(0, 10).map((profit: any) => (
                <TableRow key={profit.id}>
                  <TableCell>
                    {new Date(profit.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {profit.operationType}
                    </Badge>
                  </TableCell>
                  <TableCell>{profit.operatorFrom || "-"}</TableCell>
                  <TableCell>{profit.operatorTo || "-"}</TableCell>
                  <TableCell className="font-mono">
                    {Number(profit.grossAmount).toLocaleString()} {profit.currency}
                  </TableCell>
                  <TableCell className="font-mono">
                    {Number(profit.feeAmount).toLocaleString()} {profit.currency}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {Number(profit.netProfit).toLocaleString()} {profit.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={Number(profit.profitMargin) > 0 ? "default" : "secondary"}>
                      {Number(profit.profitMargin || 0).toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
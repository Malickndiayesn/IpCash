import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, PieChart, Activity, TrendingUp } from "lucide-react";

export function AdminOperationDiagrams() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: () => apiRequest("GET", "/api/admin/analytics").then(res => res.json()),
  });

  const { data: profitsByOperation, isLoading: profitsLoading } = useQuery({
    queryKey: ["/api/admin/profits/by-operation"],
    queryFn: () => apiRequest("GET", "/api/admin/profits/by-operation").then(res => res.json()),
  });

  if (analyticsLoading || profitsLoading) {
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

  // Créer des données pour les graphiques simplifiés
  const operationData = profitsByOperation?.map((op: any, index: number) => ({
    type: op.operationType,
    profit: Number(op.totalProfit || 0),
    transactions: Number(op.transactionCount || 0),
    margin: Number(op.avgProfitMargin || 0),
    color: `hsl(${index * 60}, 70%, 50%)`
  })) || [];

  const totalProfit = operationData.reduce((acc, op) => acc + op.profit, 0);
  const totalTransactions = operationData.reduce((acc, op) => acc + op.transactions, 0);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble des métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Opérations</p>
                <p className="text-2xl font-bold">{operationData.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions Totales</p>
                <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Total</p>
                <p className="text-2xl font-bold">{totalProfit.toLocaleString()} XOF</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Marge Moyenne</p>
                <p className="text-2xl font-bold">
                  {operationData.length > 0 
                    ? (operationData.reduce((acc, op) => acc + op.margin, 0) / operationData.length).toFixed(1)
                    : 0
                  }%
                </p>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagramme en barres des profits par opération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Profits par Type d'Opération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operationData.map((operation, index) => {
              const percentageOfTotal = totalProfit > 0 ? (operation.profit / totalProfit) * 100 : 0;
              return (
                <div key={operation.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{operation.type}</span>
                    <span className="text-sm text-gray-600">
                      {operation.profit.toLocaleString()} XOF ({percentageOfTotal.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(percentageOfTotal, 2)}%`,
                        backgroundColor: operation.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{operation.transactions.toLocaleString()} transactions</span>
                    <span>Marge: {operation.margin.toFixed(2)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Diagramme circulaire des transactions par opération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Répartition des Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Représentation visuelle simplifiée du camembert */}
            <div className="relative">
              <div className="w-48 h-48 mx-auto relative">
                {operationData.map((operation, index) => {
                  const percentage = totalTransactions > 0 ? (operation.transactions / totalTransactions) * 100 : 0;
                  const radius = 90;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const rotation = operationData
                    .slice(0, index)
                    .reduce((acc, op) => acc + ((op.transactions / totalTransactions) * 360), -90);

                  return (
                    <svg
                      key={operation.type}
                      className="absolute inset-0 w-full h-full"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="none"
                        stroke={operation.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                      />
                    </svg>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Détails par Opération</h3>
              {operationData.map((operation) => {
                const percentage = totalTransactions > 0 ? (operation.transactions / totalTransactions) * 100 : 0;
                return (
                  <div key={operation.type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: operation.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{operation.type}</span>
                        <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {operation.transactions.toLocaleString()} transactions
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau de performance détaillé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Opérationnelle Détaillée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Type d'Opération</th>
                  <th className="text-right p-3">Transactions</th>
                  <th className="text-right p-3">Profit Total</th>
                  <th className="text-right p-3">Profit Moyen</th>
                  <th className="text-right p-3">Marge (%)</th>
                  <th className="text-right p-3">Part du Marché</th>
                </tr>
              </thead>
              <tbody>
                {operationData.map((operation) => {
                  const marketShare = totalTransactions > 0 ? (operation.transactions / totalTransactions) * 100 : 0;
                  const avgProfit = operation.transactions > 0 ? operation.profit / operation.transactions : 0;
                  
                  return (
                    <tr key={operation.type} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: operation.color }}
                          />
                          <span className="font-medium">{operation.type}</span>
                        </div>
                      </td>
                      <td className="text-right p-3 font-mono">
                        {operation.transactions.toLocaleString()}
                      </td>
                      <td className="text-right p-3 font-mono">
                        {operation.profit.toLocaleString()} XOF
                      </td>
                      <td className="text-right p-3 font-mono">
                        {Math.round(avgProfit).toLocaleString()} XOF
                      </td>
                      <td className="text-right p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          operation.margin > 5 ? 'bg-green-100 text-green-800' :
                          operation.margin > 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {operation.margin.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right p-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.max(marketShare, 2)}%`,
                                backgroundColor: operation.color
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">
                            {marketShare.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
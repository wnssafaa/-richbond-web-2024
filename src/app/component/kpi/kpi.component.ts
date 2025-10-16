import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

import { KpiService, MerchandiserAssignmentTracking, AppUsageStats, ReportCompletionStats } from '../../services/kpi.service';

// Enregistrer tous les composants de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.css'
})
export class KpiComponent implements OnInit, OnDestroy {
  @ViewChild('assignmentPaginator') assignmentPaginator!: MatPaginator;
  @ViewChild('reportPaginator') reportPaginator!: MatPaginator;

  // Données
  assignmentData: MerchandiserAssignmentTracking[] = [];
  appUsageData: AppUsageStats | null = null;
  reportData: ReportCompletionStats[] = [];

  // Table data sources
  assignmentDataSource = new MatTableDataSource<MerchandiserAssignmentTracking>();
  reportDataSource = new MatTableDataSource<ReportCompletionStats>();

  // Colonnes des tables
  assignmentColumns: string[] = ['merchandiserName', 'region', 'totalAssignments', 'completionRate', 'status', 'lastActivity'];
  reportColumns: string[] = ['merchandiserName', 'region', 'totalReports', 'completionRate', 'status', 'averageTime'];

  // Filtres
  selectedRegion: string = '';
  selectedPeriod: string = 'month';
  dateRange = {
    start: new Date(),
    end: new Date()
  };

  // Options de filtres
  regions: string[] = ['Toutes', 'Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Marrakech-Safi', 'Fès-Meknès', 'Tanger-Tétouan-Al Hoceïma'];
  periods: string[] = ['week', 'month', 'quarter', 'year'];

  // Graphiques
  assignmentChart: Chart | null = null;
  usageChart: Chart | null = null;
  reportChart: Chart | null = null;
  completionTrendChart: Chart | null = null;

  // Loading states
  isLoading = false;

  constructor(
    private kpiService: KpiService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadAllData(): void {
    this.isLoading = true;
    
    this.kpiService.getAllKpiData().subscribe({
      next: (data) => {
        this.assignmentData = data.assignmentTracking;
        this.appUsageData = data.appUsageStats;
        this.reportData = data.reportCompletion;
        
        this.updateDataSources();
        this.createCharts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des KPIs:', error);
        this.isLoading = false;
      }
    });
  }

  updateDataSources(): void {
    // Filtrer les données selon les critères sélectionnés
    let filteredAssignments = this.assignmentData;
    let filteredReports = this.reportData;

    if (this.selectedRegion && this.selectedRegion !== 'Toutes') {
      filteredAssignments = this.assignmentData.filter(item => item.region === this.selectedRegion);
      filteredReports = this.reportData.filter(item => item.region === this.selectedRegion);
    }

    this.assignmentDataSource.data = filteredAssignments;
    this.reportDataSource.data = filteredReports;
  }

  createCharts(): void {
    this.createAssignmentChart();
    this.createUsageChart();
    this.createReportChart();
    this.createCompletionTrendChart();
  }

  private createAssignmentChart(): void {
    const ctx = document.getElementById('assignmentChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.assignmentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.assignmentData.map(item => item.merchandiserName),
        datasets: [
          {
            label: 'Assignations Complétées',
            data: this.assignmentData.map(item => item.completedAssignments),
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 1
          },
          {
            label: 'Assignations en Attente',
            data: this.assignmentData.map(item => item.pendingAssignments),
            backgroundColor: '#FF9800',
            borderColor: '#FF9800',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Suivi des Affectations par Merchandiser'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            }
          }
        }
      }
    });
  }

  private createUsageChart(): void {
    const ctx = document.getElementById('usageChart') as HTMLCanvasElement;
    if (!ctx || !this.appUsageData) return;

    this.usageChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Utilisateurs Actifs', 'Utilisateurs Inactifs'],
        datasets: [{
          data: [this.appUsageData.activeUsers, this.appUsageData.totalUsers - this.appUsageData.activeUsers],
          backgroundColor: ['#2196F3', '#E0E0E0'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Taux d\'Utilisation Globale'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private createReportChart(): void {
    const ctx = document.getElementById('reportChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.reportChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.reportData.map(item => item.merchandiserName),
        datasets: [{
          label: 'Taux de Completion (%)',
          data: this.reportData.map(item => item.completionRate),
          backgroundColor: this.reportData.map(item => 
            item.completionRate >= 90 ? '#4CAF50' : 
            item.completionRate >= 80 ? '#FF9800' : '#F44336'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Finalisation des Rapports par Merchandiser'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  private createCompletionTrendChart(): void {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Calculer la moyenne des taux de completion par mois
    const months = ['Oct 2023', 'Nov 2023', 'Déc 2023', 'Jan 2024'];
    const avgCompletionRates = months.map(month => {
      const rates = this.reportData.map(report => {
        const monthData = report.reportsByMonth.find(m => m.month === month);
        return monthData ? (monthData.completed / monthData.total) * 100 : 0;
      });
      return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    });

    this.completionTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Taux de Completion Moyen (%)',
          data: avgCompletionRates,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution du Taux de Completion'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  // Méthodes de filtrage
  onRegionChange(): void {
    this.updateDataSources();
    this.refreshCharts();
  }

  onPeriodChange(): void {
    // Ici vous pourriez filtrer par période si nécessaire
    this.refreshCharts();
  }

  refreshCharts(): void {
    this.destroyCharts();
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  // Utilitaires
  getCompletionStatus(rate: number): string {
    if (rate >= 90) return 'excellent';
    if (rate >= 80) return 'good';
    if (rate >= 70) return 'average';
    return 'poor';
  }

  getCompletionRate(rate: number): string {
    if (rate >= 90) return 'primary';
    if (rate >= 80) return 'accent';
    if (rate >= 70) return 'warn';
    return 'warn';
  }

  getCompletionColor(rate: number): string {
    if (rate >= 90) return '#4CAF50';
    if (rate >= 80) return '#FF9800';
    if (rate >= 70) return '#FFC107';
    return '#F44336';
  }

  getAssignmentStatus(assignments: MerchandiserAssignmentTracking): string {
    const completionRate = assignments.completionRate;
    if (completionRate >= 90) return 'Excellente';
    if (completionRate >= 80) return 'Bonne';
    if (completionRate >= 70) return 'Moyenne';
    return 'À améliorer';
  }

  // Export des données
  exportToExcel(): void {
    // Implémentation de l'export Excel
    console.log('Export Excel - À implémenter');
  }

  exportToPDF(): void {
    // Implémentation de l'export PDF
    console.log('Export PDF - À implémenter');
  }

  private destroyCharts(): void {
    if (this.assignmentChart) {
      this.assignmentChart.destroy();
      this.assignmentChart = null;
    }
    if (this.usageChart) {
      this.usageChart.destroy();
      this.usageChart = null;
    }
    if (this.reportChart) {
      this.reportChart.destroy();
      this.reportChart = null;
    }
    if (this.completionTrendChart) {
      this.completionTrendChart.destroy();
      this.completionTrendChart = null;
    }
  }
}

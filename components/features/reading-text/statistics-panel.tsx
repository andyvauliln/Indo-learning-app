"use client"

import { StatisticsData } from "@/types/reading-text"

interface StatisticsPanelProps {
    statistics: StatisticsData
}

export function StatisticsPanel({ statistics }: StatisticsPanelProps) {
    const {
        learnedCount,
        totalSentences,
        wordCount,
        learnedPercentage,
        daysPassed,
        totalDaysGoal
    } = statistics

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <StatCard
                value={`${learnedCount}/${totalSentences}`}
                label="Sentences Learned"
                subtitle={`${learnedPercentage}%`}
            />
            <StatCard
                value={wordCount}
                label="Total Words"
            />
            <StatCard
                value={daysPassed}
                label="Days Passed"
            />
            <StatCard
                value={totalDaysGoal}
                label="Total Days Goal"
            />
        </div>
    )
}

interface StatCardProps {
    value: string | number
    label: string
    subtitle?: string
}

function StatCard({ value, label, subtitle }: StatCardProps) {
    return (
        <div className="text-center">
            <div className="text-2xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
            {subtitle && (
                <div className="text-xs text-primary font-medium">{subtitle}</div>
            )}
        </div>
    )
}

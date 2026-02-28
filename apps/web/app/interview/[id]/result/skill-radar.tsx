/**
 * SkillRadar — Recharts RadarChart showing 5 competency dimensions.
 */
'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface SkillRadarProps {
  communicationScore: number
  technicalScore: number
  behavioralScore: number
  problemSolvingScore: number
  domainExpertiseScore: number
}

export function SkillRadar({
  communicationScore,
  technicalScore,
  behavioralScore,
  problemSolvingScore,
  domainExpertiseScore,
}: SkillRadarProps) {
  const data = [
    { subject: 'Communication', score: communicationScore, fullMark: 100 },
    { subject: 'Technical', score: technicalScore, fullMark: 100 },
    { subject: 'Behavioral', score: behavioralScore, fullMark: 100 },
    { subject: 'Problem\nSolving', score: problemSolvingScore, fullMark: 100 },
    { subject: 'Domain\nExpertise', score: domainExpertiseScore, fullMark: 100 },
  ]

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid
            stroke="#3f3f46"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#e4e4e7',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value}`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

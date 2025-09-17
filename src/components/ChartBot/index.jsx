import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import chartBotApi from '../../services/chartBotApi'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Card } from '../ui/card'
import { Badge } from '../ui/Badge'
import toast from 'react-hot-toast'

const ChatBot = () => {
  const [data, setData] = useState('')
  const [chartConfig, setChartConfig] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chartTypes, setChartTypes] = useState([])

  // Sample data
  const sampleData = [
    { month: 'Jan', sales: 100, profit: 20, tickets: 15 },
    { month: 'Feb', sales: 150, profit: 35, tickets: 22 },
    { month: 'Mar', sales: 200, profit: 50, tickets: 18 },
    { month: 'Apr', sales: 180, profit: 45, tickets: 25 },
    { month: 'May', sales: 220, profit: 55, tickets: 30 }
  ]

  useEffect(() => {
    loadChartTypes()
  }, [])

  const loadChartTypes = async () => {
    try {
      const result = await chartBotApi.getChartTypes()
      if (result.success) {
        setChartTypes(result.chartTypes)
      }
    } catch (error) {
      console.error('Failed to load chart types:', error)
    }
  }

  const handleGenerateChart = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const parsedData = data ? JSON.parse(data) : sampleData
      const result = await chartBotApi.generateChart(parsedData, {
        chartType: 'auto',
        title: 'Data Visualization',
        description: 'AI-generated chart'
      })

      if (result.success) {
        setChartConfig(result.chartConfig)
        toast.success('Chart generated successfully!')
      } else {
        setError(result.error)
        toast.error('Failed to generate chart')
      }
    } catch (err) {
      setError('Failed to generate chart: ' + err.message)
      toast.error('Failed to generate chart')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const parsedData = data ? JSON.parse(data) : sampleData
      const result = await chartBotApi.analyzeData(parsedData)

      if (result.success) {
        setAnalysis(result.analysis)
        toast.success('Data analyzed successfully!')
      } else {
        setError(result.error)
        toast.error('Failed to analyze data')
      }
    } catch (err) {
      setError('Failed to analyze data: ' + err.message)
      toast.error('Failed to analyze data')
    } finally {
      setLoading(false)
    }
  }

  const handleSmartChart = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const parsedData = data ? JSON.parse(data) : sampleData
      const result = await chartBotApi.generateSmartChart(parsedData, {
        title: 'AI-Recommended Chart',
        chartType: 'auto'
      })

      if (result.success) {
        setChartConfig(result.chartConfig)
        setAnalysis(result.analysis)
        toast.success('Smart chart generated successfully!')
      } else {
        setError(result.error)
        toast.error('Failed to generate smart chart')
      }
    } catch (err) {
      setError('Failed to generate smart chart: ' + err.message)
      toast.error('Failed to generate smart chart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Bot</h1>
        <p className="text-gray-600">AI-powered chart generation using Gemini</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data Input</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data (JSON format):
            </label>
            <Textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder={JSON.stringify(sampleData, null, 2)}
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={handleGenerateChart} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Generating...' : 'Generate Chart'}
            </Button>
            <Button 
              onClick={handleAnalyzeData} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Analyzing...' : 'Analyze Data'}
            </Button>
            <Button 
              onClick={handleSmartChart} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Generating...' : 'Smart Chart'}
            </Button>
          </div>

          {chartTypes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available Chart Types:</p>
              <div className="flex flex-wrap gap-1">
                {chartTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}
        </Card>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Analysis */}
          {analysis && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Data Analysis</h3>
              <p className="text-gray-700">{analysis}</p>
            </Card>
          )}

          {/* Chart Configuration */}
          {chartConfig && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Chart Configuration</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Type:</strong> {chartConfig.chartType}</p>
                <p><strong>Title:</strong> {chartConfig.title}</p>
                {chartConfig.description && (
                  <p><strong>Description:</strong> {chartConfig.description}</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  )
}

export default ChatBot

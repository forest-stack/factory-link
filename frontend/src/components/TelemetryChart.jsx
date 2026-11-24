import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Spin } from 'antd';
import { formatDate, formatTime } from '../format';
import { NoData } from './Shared';

echarts.use([
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const metricConfig = {
  temperature: { name: '温度', unit: '℃', color: '#087c83' },
  currentAmps: { name: '電流', unit: 'A', color: '#4765bf' },
  rpm: { name: '回転数', unit: 'rpm', color: '#9951b2' },
};

export default function TelemetryChart({
  samples,
  metric = 'temperature',
  limit,
  loading = false,
}) {
  const container = useRef(null);
  const chart = useRef(null);
  const hasData = Boolean(samples?.length);
  const config = metricConfig[metric];

  const option = useMemo(() => {
    if (!samples?.length) return {};
    const series = [
      {
        name: config.name,
        type: 'line',
        data: samples.map((sample) => [sample.sampledAt, sample[metric]]),
        showSymbol: samples.length < 3,
        symbolSize: 7,
        lineStyle: { width: 3, color: config.color },
        itemStyle: { color: config.color },
        areaStyle: { color: config.color, opacity: 0.1 },
      },
    ];
    if (limit !== undefined) {
      series.push({
        name: 'しきい値',
        type: 'line',
        data: samples.map((sample) => [sample.sampledAt, limit]),
        showSymbol: false,
        lineStyle: { type: 'dashed', width: 1.5, color: '#dd7341' },
        itemStyle: { color: '#dd7341' },
      });
    }

    return {
      animation: false,
      grid: { top: 55, bottom: 34, left: 49, right: 22 },
      legend: { left: 10, top: 5, textStyle: { color: '#53677b' } },
      xAxis: {
        type: 'time',
        axisLabel: {
          hideOverlap: true,
          color: '#62758a',
          formatter: formatTime,
        },
        axisLine: { lineStyle: { color: '#cbd7e1' } },
        splitNumber: 5,
      },
      yAxis: {
        type: 'value',
        name: config.unit,
        nameTextStyle: { color: '#53677b' },
        axisLabel: { color: '#62758a' },
        splitLine: { lineStyle: { color: '#e9eff4', type: 'dashed' } },
      },
      tooltip: {
        trigger: 'axis',
        renderMode: 'richText',
        formatter(points) {
          const lines = points.map(
            (point) => `${point.seriesName}  ${point.value[1]} ${config.unit}`,
          );
          return [formatDate(points[0].value[0]), ...lines].join('\n');
        },
      },
      series,
    };
  }, [config, limit, metric, samples]);

  useEffect(() => {
    if (!hasData) return undefined;
    chart.current = echarts.init(container.current);
    const observer = new ResizeObserver(() => chart.current?.resize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, [hasData]);

  // 图表实例只在挂载时创建。REST 轮询刷新时只替换图表配置。
  useEffect(() => {
    if (hasData) chart.current?.setOption(option, { notMerge: true });
  }, [hasData, option]);

  if (!hasData) {
    return (
      <div className="chart-placeholder">
        {loading ? (
          <Spin />
        ) : (
          <NoData description="表示できる計測データがありません" />
        )}
      </div>
    );
  }

  return (
    <div
      ref={container}
      className="telemetry-chart"
      role="img"
      aria-label={`${config.name}の推移グラフ`}
    />
  );
}

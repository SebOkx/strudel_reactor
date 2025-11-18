import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function D3Graph({ data, windowSize = 50 }) {
    const svgRef = useRef(null);
    const [tick, setTick] = useState(0);

    const initialZeroCount = (Array.isArray(data) ? data.filter(d => d === 0).length : 0);
    const [history, setHistory] = useState(() => Array(windowSize).fill(initialZeroCount));

    //On every tick (or when data changes) push new zeroCount and keep the last windowSize values
    useEffect(() => {
        const zeroCount = (Array.isArray(data) ? data.filter(d => d === 0).length : 0);
        setHistory(prev => {
            //drop oldest, add newest, always keep windowSize length
            const next = prev.slice(- (windowSize - 1)).concat(zeroCount);
            //if prev was shorter, fill to windowSize
            if (next.length < windowSize) {
                return Array(windowSize - next.length).fill(zeroCount).concat(next);
            }
            return next;
        });
    }, [data, tick, windowSize]);

    //Draw chart whenever data changes
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const width = +svg.attr("width");
        const height = +svg.attr("height");
        svg.selectAll("*").remove();

        const xScale = d3.scaleBand()
            .domain(d3.range(windowSize).map(String))
            .range([0, width])
            .padding(0.2);

        const maxZeros = Math.max(data?.length || 0, 1);
        const yScale = d3.scaleLinear()
            .domain([0, maxZeros])
            .range([height, 0]);

        svg.selectAll("rect")
            .data(history)
            .enter()
            .append("rect")
            .attr("x", (_, i) => xScale(String(i)))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d))
            .attr("fill", "#3730a3");

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(i => {
                const idx = Number(i);
                const absoluteTick = tick - (windowSize - 1) + idx;
                return absoluteTick >= 0 ? absoluteTick : "";
            })
            .tickValues(d3.range(windowSize).map(String));

        const yAxis = d3.axisLeft(yScale).ticks(Math.min(5, maxZeros));

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

    }, [history, data, tick, windowSize]);

    //Advance tick every second
    useEffect(() => {
        const interval = setInterval(() => setTick(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    return <svg ref={svgRef} width={400} height={200} />;
}

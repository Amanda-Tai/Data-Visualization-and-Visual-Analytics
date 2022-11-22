import { select,
				 csv,
         scaleLinear,
         scaleBand,
         extent,
         axisBottom,
         axisLeft
} from 'd3';

import { dropdownMenu } from './0816189_dropdownMenu.js';

const width = document.body.clientWidth;
const height = document.body.clientHeight;
const margin = { top: 50, right: 80, bottom:80, left: 80};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = select('svg')
  .attr('width', width)
  .attr('height', height);

const selectedData = [
  'popularity',
  //'duration_ms',
  'danceability',
  'energy',
  'key',
  'loudness',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'valence',
  'tempo'
];

const presentationData = [
  'count',
  'percentage'
];

const barNumchoice = [
	5,
  10,
  15,
  20,
25,
30,
35,
40,
45,
50
];

let data;
let column;
const onXMenuClicked = column_ => {
	column = column_;
  render();
};

let presentation;
const onYMenuClicked = presentation_ => {
	presentation = presentation_;
  render();
};

let bar_num;
const onBarNumClicked = bar_num_ => {
	bar_num = +bar_num_;
  console.log(bar_num);
  render();
};

const render = () => {
  select('#x-menu')
  .call(dropdownMenu, {
    options: selectedData,
    onOptionClicked: onXMenuClicked,
    selectedOption: column
  }); 
  
  select('#y-menu')
  .call(dropdownMenu, {
    options: presentationData,
    onOptionClicked: onYMenuClicked,
    selectedOption: presentation
  }); 
  
  select('#bar_num-menu')
  .call(dropdownMenu, {
    options: barNumchoice,
    onOptionClicked: onBarNumClicked,
    selectedOption: bar_num
  }); 
  
  svg.selectAll("*").remove();
  // calculate the x ticks, and x range
  const value = d => d[column];
  let valueMin, valueMax;
  [valueMin, valueMax] = extent(data, value);
  let x_ticks = []; // bar_num
  let x_range = []; // bar_num + 1
  let range_l = valueMin;
  let range_u;
  x_range.push(range_l);
  let interval = (valueMax - valueMin) / bar_num;
  for(let i = 1; i <= bar_num; i++) {
  	range_u = Math.round((valueMin + interval * i) *100) /100;
    x_ticks.push(Math.round(((range_l + range_u) / 2) *100) / 100);
    x_range.push(range_u);
    range_l = range_u;
  }
  x_range[bar_num] = valueMax;
  
  // count the number of item in the x range
  let x_range_cnt = Array(bar_num).fill(0);
  data.forEach(d => {
  	for(let i=0; i< bar_num; i++) {
    	if(value(d) <= x_range[i+1]) {
      	x_range_cnt[i] += 1;
        break;
      }
    }
  })
  
  if(presentation === 'percentage') {
  	let total = x_range_cnt.reduce((accumulator, num) => accumulator + num);
    x_range_cnt.forEach((d, i) => x_range_cnt[i] = Math.round(d/total*1000)/10);
  }
  const xScale = scaleBand()
  
    .domain(x_ticks)
    .range([0, innerWidth])
    .padding(0.1);
  
  const yScale = scaleLinear()
    .domain(extent(x_range_cnt))
    .range([innerHeight, 0]);
  
  const g = svg.append('g')
  	.attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  const yAxisTickFormat = number => { 
    if(presentation === 'percentage') {
    	number += '%';
    }
    return number;
  }
  const yAxis = axisLeft(yScale)
  	.tickFormat(yAxisTickFormat)
  	//.tickLine(white)
  	.tickSize(-innerWidth);
  
  const yAxisG = g.append('g')
  	.call(yAxis)
  	.select('.domain').remove();
  
  const xAxisG = g.append('g')
  	.call(axisBottom(xScale))
  	.attr('transform', `translate(0, ${innerHeight})`)
  	.selectAll('.domain, .tick line')
  	.remove();
  
  const bars = g.selectAll('rect').data(x_range_cnt)
  	.enter().append('rect')
    .attr('x', (d, i) => xScale(x_ticks[i]))
    .attr('y', d => yScale(d)) 
  	.attr('width', xScale.bandwidth())
    .transition() //動態插入開始！
    .duration(1500)
    .delay(function(d, i) { return i * 100; }) //動態插入結束！下面就是告訴他我要長高呀
  	.attr('height', d => innerHeight - yScale(d))
};

//read and process file
d3.csv('http://vis.lab.djosix.com:2020/data/spotify_tracks.csv', d => {
	 return {
     popularity: d.popularity,
     duration_ms: d.duration_ms,
     danceability: d.danceability,
     energy: d.energy,
     key: d.key,
     //explicit: d.explicit,
     loudness: d.loudness,
     speechiness: d.speechiness,
     acousticness: d.acousticness,
     instrumentalness: d.instrumentalness,
     liveness: d.liveness,
     valence: d.valence,
     tempo: d.tempo
  }
})
  .then(loadedData => {
  	data = loadedData;
    data.forEach(d => {
			d['popularity'] = +d['popularity'];
      d['duration_ms'] = +d['duration_ms'];
      d['danceability'] = +d['danceability'];
      d['energy'] = +d['energy'];
      d['key'] = +d['key'];
      //d['explicit'] = +d['explicit'];
      d['loudness'] = +d['loudness'];
      d['speechiness'] = +d['speechiness'];
      d['acousticness'] = +d['acousticness'];
      d['instrumentalness'] = +d['instrumentalness'];
      d['liveness'] = +d['liveness'];
      d['valence'] = +d['valence'];
      d['tempo'] = +d['tempo'];
    });
    column = 'popularity';
    prese
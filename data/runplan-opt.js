/*---------------------------------------------------------------------------------------------------
   Copyright (c) 2013 Intel Performance Learning Solutions Ltd, Intel Corporation.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
---------------------------------------------------------------------------------------------------*/

var outputRequired = {"products":[{"product":"Product1","priority":"1","outputTargetTarget":"100","processed":"80","remain":"20","offset":"0","ulimit":"300","llimit":"50","meet":"100","targetType":"llimit"},{"product":"Product2","priority":"2","outputTargetTarget":"200","processed":"100","remain":"100","offset":"0","ulimit":"1000","llimit":"100","meet":"300","targetType":"llimit"},{"product":"Product4","priority":"3","outputTargetTarget":"100","processed":"0","remain":"-100","offset":"0","ulimit":"200","llimit":"10","meet":"100","targetType":"llimit"}]};

var staticRunPlanData = {
    runplan:[
        {
            time:0,
            toolid:'ABC702',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:4.64,
            toolid:'ABC702',
            lotid:'30',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:14.26,
            toolid:'ABC702',
            lotid:'38',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:23.87,
            toolid:'ABC702',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:32.82,
            toolid:'ABC702',
            lotid:'68',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:42.44,
            toolid:'ABC702',
            state:'Maintenance',
            setup:'Product2'
        },
        {
            time:75.44,
            toolid:'ABC702',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:76.79,
            toolid:'ABC702',
            lotid:'121',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:87.41,
            toolid:'ABC702',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:92.74,
            toolid:'ABC702',
            lotid:'137',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:102.35,
            toolid:'ABC702',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:110.54,
            toolid:'ABC702',
            lotid:'156',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:120.15,
            toolid:'ABC702',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:123.52,
            toolid:'ABC702',
            lotid:'160',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:133.14,
            toolid:'ABC702',
            lotid:'164',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:142.75,
            toolid:'ABC702',
            lotid:'172',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:152.37,
            toolid:'ABC702',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC703',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:5.5,
            toolid:'ABC703',
            lotid:'21',
            state:'Run',quantity:5,
            setup:'Product1'
        },
	{
            time:25.5,
            toolid:'ABC703',
            lotid:'2198',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:19.39,
            toolid:'ABC703',
            state:'Idle',
            setup:'Product1'
        },        {
            time:36.24,
            toolid:'ABC703',
            lotid:'109',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:66.24,
            toolid:'ABC703',
            lotid:'103',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:80.12,
            toolid:'ABC703',
            lotid:'115',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:94.01,
            toolid:'ABC703',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:102.64,
            toolid:'ABC703',
            lotid:'147',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:116.53,
            toolid:'ABC703',
            lotid:'148',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:130.42,
            toolid:'ABC703',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:141.01,
            toolid:'ABC703',
            lotid:'180',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:154.9,
            toolid:'ABC703',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:160.37,
            toolid:'ABC703',
            lotid:'217',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:174.26,
            toolid:'ABC703',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:0,
            toolid:'ABC704',
            state:'Maintenance',
            setup:0
        },
        {
            time:5.9,
            toolid:'ABC704',
            state:'Setup',
            setup:'Product1'
        },
        {
            time:7.4,
            toolid:'ABC704',
            lotid:'26',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:21.29,
            toolid:'ABC704',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:43.74,
            toolid:'ABC704',
            lotid:'71',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:57.63,
            toolid:'ABC704',
            lotid:'73',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:71.51,
            toolid:'ABC704',
            lotid:'95',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:85.4,
            toolid:'ABC704',
            lotid:'98',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:99.29,
            toolid:'ABC704',
            lotid:'114',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:113.18,
            toolid:'ABC704',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:114.68,
            toolid:'ABC704',
            lotid:'135',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:124.3,
            toolid:'ABC704',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:134.02,
            toolid:'ABC704',
            lotid:'174',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:143.64,
            toolid:'ABC704',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:154.34,
            toolid:'ABC704',
            lotid:'204',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:163.95,
            toolid:'ABC704',
            lotid:'208',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:173.57,
            toolid:'ABC704',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC705',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:7.6,
            toolid:'ABC705',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:77.79,
            toolid:'ABC705',
            lotid:'120',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:91.68,
            toolid:'ABC705',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:104.24,
            toolid:'ABC705',
            lotid:'150',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:119.24,
            toolid:'ABC705',
            lotid:'150',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:159.13,
            toolid:'ABC705',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:0,
            toolid:'ABC706',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:5.5,
            toolid:'ABC706',
            state:'Powersave',
            setup:'Product2'
        },
        {
            time:76.48,
            toolid:'ABC706',
            lotid:'117',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:88.08,
            toolid:'ABC706',
            lotid:'133',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:97.69,
            toolid:'ABC706',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:105.44,
            toolid:'ABC706',
            lotid:'154',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:123.52,
            toolid:'ABC706',
            lotid:'159',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:133.14,
            toolid:'ABC706',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:149.07,
            toolid:'ABC706',
            lotid:'191',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:158.68,
            toolid:'ABC706',
            lotid:'207',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:168.3,
            toolid:'ABC706',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC707',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:5.7,
            toolid:'ABC707',
            state:'Setup',
            setup:'Product1'
        },
        {
            time:7.2,
            toolid:'ABC707',
            lotid:'1',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:21.09,
            toolid:'ABC707',
            lotid:'16',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:34.98,
            toolid:'ABC707',
            lotid:'35',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:48.87,
            toolid:'ABC707',
            lotid:'6',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:62.76,
            toolid:'ABC707',
            lotid:'41',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:76.64,
            toolid:'ABC707',
            lotid:'58',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:90.53,
            toolid:'ABC707',
            lotid:'108',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:104.42,
            toolid:'ABC707',
            lotid:'116',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:118.31,
            toolid:'ABC707',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:119.81,
            toolid:'ABC707',
            lotid:'138',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:129.43,
            toolid:'ABC707',
            lotid:'163',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:139.04,
            toolid:'ABC707',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:149.07,
            toolid:'ABC707',
            lotid:'188',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:158.68,
            toolid:'ABC707',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC709',
            state:'Powersave',
            setup:'Product1'
        },
        {
            time:19.81,
            toolid:'ABC709',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:21.31,
            toolid:'ABC709',
            lotid:'44',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:28.93,
            toolid:'ABC709',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:30.81,
            toolid:'ABC709',
            lotid:'61',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:40.42,
            toolid:'ABC709',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:45.49,
            toolid:'ABC709',
            state:'Setup',
            setup:'Product1'
        },
        {
            time:46.99,
            toolid:'ABC709',
            lotid:'77',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:60.88,
            toolid:'ABC709',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:63.6,
            toolid:'ABC709',
            lotid:'100',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:79.6,
            toolid:'ABC709',
            lotid:'123',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:110.49,
            toolid:'ABC709',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:121.28,
            toolid:'ABC709',
            lotid:'158',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:145.24,
            toolid:'ABC709',
            lotid:'187',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:159.13,
            toolid:'ABC709',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:0,
            toolid:'ABC710',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:11.4,
            toolid:'ABC710',
            state:'Setup',
            setup:'Product1'
        },
        {
            time:12.9,
            toolid:'ABC710',
            lotid:'4',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:26.79,
            toolid:'ABC710',
            lotid:'10',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:40.68,
            toolid:'ABC710',
            lotid:'14',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:54.57,
            toolid:'ABC710',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:56.07,
            toolid:'ABC710',
            lotid:'18',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:65.68,
            toolid:'ABC710',
            lotid:'23',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:75.3,
            toolid:'ABC710',
            lotid:'40',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:84.91,
            toolid:'ABC710',
            lotid:'113',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:94.53,
            toolid:'ABC710',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:102.64,
            toolid:'ABC710',
            lotid:'145',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:111.87,
            toolid:'ABC710',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:145.24,
            toolid:'ABC710',
            lotid:'186',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:154.86,
            toolid:'ABC710',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:155.6,
            toolid:'ABC710',
            lotid:'210',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:165.22,
            toolid:'ABC710',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:3.4,
            toolid:'ABC711',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:4.64,
            toolid:'ABC711',
            lotid:'17',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:14.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:34.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:54.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:74.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:94.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:114.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:134.26,
            toolid:'ABC711',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:157.62,
            toolid:'ABC711',
            lotid:'211',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:167.23,
            toolid:'ABC711',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC712',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:3.1,
            toolid:'ABC712',
            lotid:'2',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:16.99,
            toolid:'ABC712',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:25.26,
            toolid:'ABC712',
            lotid:'57',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:38.59,
            toolid:'ABC712',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:48.72,
            toolid:'ABC712',
            lotid:'82',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:62.61,
            toolid:'ABC712',
            lotid:'86',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:76.5,
            toolid:'ABC712',
            lotid:'107',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:90.39,
            toolid:'ABC712',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:123.52,
            toolid:'ABC712',
            lotid:'162',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:137.41,
            toolid:'ABC712',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:143.06,
            toolid:'ABC712',
            lotid:'184',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:156.39,
            toolid:'ABC712',
            lotid:'185',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:170.28,
            toolid:'ABC712',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:0,
            toolid:'ABC714',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:5.2,
            toolid:'ABC714',
            lotid:'27',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:14.82,
            toolid:'ABC714',
            lotid:'39',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:24.43,
            toolid:'ABC714',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:48.72,
            toolid:'ABC714',
            lotid:'80',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:58.34,
            toolid:'ABC714',
            lotid:'90',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:67.95,
            toolid:'ABC714',
            state:'Maintenance',
            setup:'Product2'
        },
        {
            time:105.44,
            toolid:'ABC714',
            lotid:'155',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:114.67,
            toolid:'ABC714',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:154.34,
            toolid:'ABC714',
            lotid:'199',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:163.95,
            toolid:'ABC714',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC715',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:3.3,
            toolid:'ABC715',
            lotid:'5',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:17.19,
            toolid:'ABC715',
            state:'Powersave',
            setup:'Product1'
        },
        {
            time:67.51,
            toolid:'ABC715',
            lotid:'105',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:81.4,
            toolid:'ABC715',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:88.08,
            toolid:'ABC715',
            lotid:'132',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:101.97,
            toolid:'ABC715',
            lotid:'140',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:115.86,
            toolid:'ABC715',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:0,
            toolid:'ABC716',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:10.9,
            toolid:'ABC716',
            lotid:'42',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:20.52,
            toolid:'ABC716',
            lotid:'43',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:30.13,
            toolid:'ABC716',
            lotid:'53',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:39.75,
            toolid:'ABC716',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:56.89,
            toolid:'ABC716',
            lotid:'88',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:66.5,
            toolid:'ABC716',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:80.76,
            toolid:'ABC716',
            lotid:'124',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:88.84,
            toolid:'ABC716',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:143.06,
            toolid:'ABC716',
            lotid:'181',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:152.68,
            toolid:'ABC716',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:154.34,
            toolid:'ABC716',
            lotid:'202',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:163.95,
            toolid:'ABC716',
            lotid:'219',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:173.57,
            toolid:'ABC716',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC717',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:4.64,
            toolid:'ABC717',
            lotid:'15',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:17.81,
            toolid:'ABC717',
            lotid:'47',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:27.43,
            toolid:'ABC717',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:35.43,
            toolid:'ABC717',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:43.74,
            toolid:'ABC717',
            lotid:'70',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:53.35,
            toolid:'ABC717',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:76.48,
            toolid:'ABC717',
            lotid:'118',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:86.1,
            toolid:'ABC717',
            state:'Powersave',
            setup:'Product2'
        },
        {
            time:160.37,
            toolid:'ABC717',
            lotid:'216',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:169.99,
            toolid:'ABC717',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC718',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:2.3,
            toolid:'ABC718',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:4.64,
            toolid:'ABC718',
            lotid:'34',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:14.26,
            toolid:'ABC718',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:15.81,
            toolid:'ABC718',
            state:'Setup',
            setup:'Product1'
        },
        {
            time:17.31,
            toolid:'ABC718',
            lotid:'50',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:33.2,
            toolid:'ABC718',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:48.2,
            toolid:'ABC718',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:61.2,
            toolid:'ABC718',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:77.79,
            toolid:'ABC718',
            lotid:'122',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:91.68,
            toolid:'ABC718',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:100.89,
            toolid:'ABC718',
            lotid:'144',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:114.78,
            toolid:'ABC718',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:149.07,
            toolid:'ABC718',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:150.57,
            toolid:'ABC718',
            lotid:'197',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:160.18,
            toolid:'ABC718',
            lotid:'198',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:169.8,
            toolid:'ABC718',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC719',
            state:'Run',quantity:5,
            setup:'Product4'
        },
        {
            time:4.8,
            toolid:'ABC719',
            state:'Idle',
            setup:'Product4'
        },
        {
            time:15.81,
            toolid:'ABC719',
            state:'Setup',
            setup:'Product1'
        },
        {
            time:17.31,
            toolid:'ABC719',
            lotid:'55',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:33.2,
            toolid:'ABC719',
            lotid:'60',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:47.09,
            toolid:'ABC719',
            lotid:'66',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:60.98,
            toolid:'ABC719',
            lotid:'75',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:74.87,
            toolid:'ABC719',
            lotid:'79',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:88.76,
            toolid:'ABC719',
            lotid:'119',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:102.64,
            toolid:'ABC719',
            lotid:'131',
            state:'Run',quantity:5,
            setup:'Product1'
        },
        {
            time:116.53,
            toolid:'ABC719',
            state:'Idle',
            setup:'Product1'
        },
        {
            time:128.3,
            toolid:'ABC719',
            state:'Setup',
            setup:'Product4'
        },
        {
            time:129.8,
            toolid:'ABC719',
            lotid:'168',
            state:'Run',quantity:5,
            setup:'Product4'
        },
        {
            time:161.05,
            toolid:'ABC719',
            state:'Setup',
            setup:'Product2'
        },
        {
            time:162.55,
            toolid:'ABC719',
            lotid:'215',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:172.16,
            toolid:'ABC719',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:0,
            toolid:'ABC720',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:1.7,
            toolid:'ABC720',
            lotid:'8',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:11.32,
            toolid:'ABC720',
            lotid:'9',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:20.93,
            toolid:'ABC720',
            lotid:'52',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:35.55,
            toolid:'ABC720',
            lotid:'54',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:45.16,
            toolid:'ABC720',
            lotid:'72',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:54.78,
            toolid:'ABC720',
            state:'Idle',
            setup:'Product2'
        },
        {
            time:59.58,
            toolid:'ABC720',
            lotid:'97',
            state:'Run',quantity:5,
            setup:'Product2'
        },
        {
            time:69.2,
            toolid:'ABC720',
            state:'Setup',
            setup:'Product3'
        },
        {
            time:70.7,
            toolid:'ABC720',
            lotid:'106',
            state:'Run',quantity:5,
            setup:'Product3'
        },
        {
            time:106.41,
            toolid:'ABC720',
            lotid:'111',
            state:'Run',quantity:5,
            setup:'Product3'
        },
        {
            time:142.13,
            toolid:'ABC720',
            state:'Idle',
            setup:'Product3'
        }
    ]
};
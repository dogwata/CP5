<template>
  <div id="container">
  <div id="app">
    <app-header/>
    <table style="width:100%">
    <tr>
    <td valign="top" >
       <show-my-channels/></td>
    <td valign="top">
       <router-view/></td>
    </tr></table>
    <br>
    <br>
    <div id="footer">
        <br>
        <a href="https://github.com/dogwata/CP5">Github</a>
    </div></div>

  </div>
</template>

<script>
 import AppHeader from './components/AppHeader';
 import ShowMyChannels from './components/ShowMyChannels';
 export default {
   name: 'App',
   components: { AppHeader, ShowMyChannels }
 }
</script>

<style>
 div {
   //display: relative !important;
 }
 body {
     font-size: 18px;
     //padding: 20px 100px 0px 100px;
     font-family: 'Avenir', Helvetica, Arial, sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
 }
 button {
     color: #fff;
     min-width: 100px;
     line-height: 1em;
     border: none;
     border-radius: 5px;
     color: white;
     padding: 5px;
     text-align: center;
     text-decoration: none;
     display: inline-block;
     font-size: 1rem;
     margin: 4px 2px;
 }
 button.primary {
     background-color: #F35537;
 }
 button.alternate {
     background-color: #77C4D3;
 }
 button:focus {
     outline: none;
 }
 button:hover {
     box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
 }
 button:active {
     transform: translateY(4px);
 }
 input {
     height: 20px;
     padding: 10px;
 }
 a {
     color: #77C4D3;
 }
 .flexWrapper {
     display:flex;
 }
 .flexRight {
     margin-left: auto;
 }
 .error {
     color: #F35537;
 }
 .column {
     width: 800px;
 }
 #footer a {
	padding-top: 10px;
	color: white !important;
	text-decoration: none;
 }

 #container {
   min-height:100%;
   position:relative;
   min-width:100%;

 }

 #header {
   padding:10px;
 }

 #body {
   padding:10px;
   padding-bottom:60px;
   padding-left:15px;
   padding-right:15px;
   background: #DCDCDC;
 }

 #container2 {
   padding-top: 15px;
   padding-left:15px;
   padding-right:15px;
   padding-bottom:30px;
   border-radius: 6px;
   margin: auto;
   max-width: 700px;
 }

 #footer {
   position:absolute;
   bottom:0;
   float: left;
   width:100%;
   height:60px;   /* Height of the footer */
   background: #444;
   text-align: center;
   color: white !important;
   text-decoration: none;
   padding: 0px 0px 0px 0px !important;
   margin: 0px !important;
   //display: block;
   overflow:hidden;
   left:0px;
 }

</style>

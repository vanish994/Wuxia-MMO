<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="props" tilewidth="64" tileheight="62" tilecount="7" columns="0" objectalignment="bottomleft">
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0" type="prop">
  <properties>
   <property name="prop" value="ambient_bamboo"/>
   <property name="anchorX" type="float" value="10"/>
   <property name="anchorY" type="float" value="47"/>
   <property name="solid" type="bool" value="false"/>
   <property name="occlusionClass" value="tall"/>
  </properties>
  <image source="images/ambient_bamboo.png" width="20" height="50"/>
 </tile>
 <tile id="1" type="prop">
  <properties>
   <property name="prop" value="ambient_blossom"/>
   <property name="anchorX" type="float" value="12"/>
   <property name="anchorY" type="float" value="33"/>
   <property name="solid" type="bool" value="false"/>
   <property name="occlusionClass" value="tall"/>
  </properties>
  <image source="images/ambient_blossom.png" width="24" height="34"/>
 </tile>
 <tile id="2" type="prop">
  <properties>
   <property name="prop" value="ambient_lantern"/>
   <property name="anchorX" type="float" value="8"/>
   <property name="anchorY" type="float" value="29"/>
   <property name="solid" type="bool" value="false"/>
   <property name="occlusionClass" value="low"/>
  </properties>
  <image source="images/ambient_lantern.png" width="16" height="32"/>
 </tile>
 <tile id="3" type="prop">
  <properties>
   <property name="prop" value="ambient_shrub"/>
   <property name="anchorX" type="float" value="10"/>
   <property name="anchorY" type="float" value="12"/>
   <property name="solid" type="bool" value="false"/>
   <property name="occlusionClass" value="low"/>
  </properties>
  <image source="images/ambient_shrub.png" width="20" height="15"/>
 </tile>
 <tile id="4" type="prop">
  <properties>
   <property name="prop" value="bridge"/>
   <property name="anchorX" type="float" value="32"/>
   <property name="anchorY" type="float" value="25"/>
   <property name="solid" type="bool" value="false"/>
   <property name="occlusionClass" value="low"/>
  </properties>
  <image source="images/bridge.png" width="64" height="26"/>
 </tile>
 <tile id="5" type="prop">
  <properties>
   <property name="prop" value="pagoda"/>
   <property name="anchorX" type="float" value="24"/>
   <property name="anchorY" type="float" value="61"/>
   <property name="solid" type="bool" value="true"/>
   <property name="occlusionClass" value="tall"/>
  </properties>
  <image source="images/pagoda.png" width="48" height="62"/>
  <objectgroup draworder="index" id="2">
   <object id="1" name="footprint" type="footprint" x="15" y="49" width="18" height="12"/>
  </objectgroup>
 </tile>
 <tile id="6" type="prop">
  <properties>
   <property name="prop" value="sect_gate"/>
   <property name="anchorX" type="float" value="28"/>
   <property name="anchorY" type="float" value="45"/>
   <property name="solid" type="bool" value="true"/>
   <property name="occlusionClass" value="tall"/>
  </properties>
  <image source="images/sect_gate.png" width="56" height="46"/>
  <objectgroup draworder="index" id="2">
   <object id="1" name="footprint" type="footprint" x="21" y="37" width="14" height="8"/>
  </objectgroup>
 </tile>
</tileset>

<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="props" tilewidth="56" tileheight="50" tilecount="4" columns="0" objectalignment="bottomleft">
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0" type="prop">
  <properties>
   <property name="prop" value="bamboo"/>
   <property name="anchorX" type="float" value="10"/>
   <property name="anchorY" type="float" value="47"/>
   <property name="solid" type="bool" value="true"/>
   <property name="occlusionClass" value="tall"/>
  </properties>
  <image source="images/bamboo.png" width="20" height="50"/>
  <objectgroup draworder="index" id="2">
   <object id="1" name="footprint" type="footprint" x="6" y="43" width="8" height="4">
    <ellipse/>
   </object>
  </objectgroup>
 </tile>
 <tile id="1" type="prop">
  <properties>
   <property name="prop" value="rock"/>
   <property name="anchorX" type="float" value="9"/>
   <property name="anchorY" type="float" value="11"/>
   <property name="solid" type="bool" value="true"/>
   <property name="occlusionClass" value="low"/>
  </properties>
  <image source="images/rock.png" width="18" height="14"/>
  <objectgroup draworder="index" id="2">
   <object id="1" name="footprint" type="footprint" x="2.5" y="6" width="13" height="5">
    <ellipse/>
   </object>
  </objectgroup>
 </tile>
 <tile id="2" type="prop">
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
 <tile id="3" type="prop">
  <properties>
   <property name="prop" value="shrub"/>
   <property name="anchorX" type="float" value="10"/>
   <property name="anchorY" type="float" value="12"/>
   <property name="solid" type="bool" value="true"/>
   <property name="occlusionClass" value="low"/>
  </properties>
  <image source="images/shrub.png" width="20" height="15"/>
  <objectgroup draworder="index" id="2">
   <object id="1" name="footprint" type="footprint" x="3" y="7" width="14" height="5">
    <ellipse/>
   </object>
  </objectgroup>
 </tile>
</tileset>

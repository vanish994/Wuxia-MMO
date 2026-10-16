<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="props" tilewidth="18" tileheight="32" tilecount="2" columns="0" objectalignment="bottomleft">
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0" type="prop">
  <properties>
   <property name="prop" value="lantern"/>
   <property name="anchorX" type="float" value="8"/>
   <property name="anchorY" type="float" value="29"/>
   <property name="solid" type="bool" value="true"/>
   <property name="occlusionClass" value="low"/>
  </properties>
  <image source="images/lantern.png" width="16" height="32"/>
  <objectgroup draworder="index" id="2">
   <object id="1" name="footprint" type="footprint" x="5.5" y="25" width="5" height="4">
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
</tileset>

<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="marsh-water-wang16" tilewidth="32" tileheight="32" tilecount="64" columns="16">
 <properties>
  <property name="kind" value="wang_corner"/>
  <property name="materials" value='["water","marsh"]'/>
  <property name="seamlessVerified" type="bool" value="true"/>
 </properties>
 <image source="images/marsh-water-wang16.png" width="512" height="128"/>
 <tile id="0">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="32"/>
  </objectgroup>
 </tile>
 <tile id="1">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="8"/>
   <object id="3" type="solid" x="0" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="2">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="8" y="16" width="24" height="4"/>
   <object id="3" type="solid" x="12" y="20" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="3">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="4">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="16" y="12" width="8" height="20"/>
   <object id="3" type="solid" x="24" y="16" width="8" height="16"/>
  </objectgroup>
 </tile>
 <tile id="5">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="24"/>
   <object id="3" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="4" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="6">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="8"/>
   <object id="3" type="solid" x="12" y="16" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="7">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="0,1,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="4"/>
   <object id="3" type="solid" x="0" y="12" width="8" height="4"/>
  </objectgroup>
 </tile>
 <tile id="8">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="3" type="solid" x="0" y="16" width="12" height="16"/>
  </objectgroup>
 </tile>
 <tile id="9">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="4"/>
   <object id="3" type="solid" x="0" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="10">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
  </objectgroup>
 </tile>
 <tile id="11">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="20" y="8" width="12" height="8"/>
  </objectgroup>
 </tile>
 <tile id="12">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="32" height="16"/>
  </objectgroup>
 </tile>
 <tile id="13">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="12" height="16"/>
   <object id="2" type="solid" x="12" y="20" width="4" height="12"/>
  </objectgroup>
 </tile>
 <tile id="14">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="16" width="16" height="16"/>
  </objectgroup>
 </tile>
 <tile id="15">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="0"/>
   <property name="wang" value="1,1,1,1"/>
  </properties>
 </tile>
 <tile id="16">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="32"/>
  </objectgroup>
 </tile>
 <tile id="17">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="8"/>
   <object id="3" type="solid" x="0" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="18">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="8" y="16" width="24" height="4"/>
   <object id="3" type="solid" x="12" y="20" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="19">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="20">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="16" y="12" width="8" height="20"/>
   <object id="3" type="solid" x="24" y="16" width="8" height="16"/>
  </objectgroup>
 </tile>
 <tile id="21">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="24"/>
   <object id="3" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="4" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="22">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="8"/>
   <object id="3" type="solid" x="12" y="16" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="23">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="0,1,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="4"/>
   <object id="3" type="solid" x="0" y="12" width="8" height="4"/>
  </objectgroup>
 </tile>
 <tile id="24">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="3" type="solid" x="0" y="16" width="12" height="16"/>
  </objectgroup>
 </tile>
 <tile id="25">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="4"/>
   <object id="3" type="solid" x="0" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="26">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
  </objectgroup>
 </tile>
 <tile id="27">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="20" y="8" width="12" height="8"/>
  </objectgroup>
 </tile>
 <tile id="28">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="32" height="16"/>
  </objectgroup>
 </tile>
 <tile id="29">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="12" height="16"/>
   <object id="2" type="solid" x="12" y="20" width="4" height="12"/>
  </objectgroup>
 </tile>
 <tile id="30">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="16" width="16" height="16"/>
  </objectgroup>
 </tile>
 <tile id="31">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="1"/>
   <property name="wang" value="1,1,1,1"/>
  </properties>
 </tile>
 <tile id="32">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="32"/>
  </objectgroup>
 </tile>
 <tile id="33">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="8"/>
   <object id="3" type="solid" x="0" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="34">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="8" y="16" width="24" height="4"/>
   <object id="3" type="solid" x="12" y="20" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="35">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="36">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="16" y="12" width="8" height="20"/>
   <object id="3" type="solid" x="24" y="16" width="8" height="16"/>
  </objectgroup>
 </tile>
 <tile id="37">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="24"/>
   <object id="3" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="4" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="38">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="8"/>
   <object id="3" type="solid" x="12" y="16" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="39">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="0,1,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="4"/>
   <object id="3" type="solid" x="0" y="12" width="8" height="4"/>
  </objectgroup>
 </tile>
 <tile id="40">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="3" type="solid" x="0" y="16" width="12" height="16"/>
  </objectgroup>
 </tile>
 <tile id="41">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="4"/>
   <object id="3" type="solid" x="0" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="42">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
  </objectgroup>
 </tile>
 <tile id="43">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="20" y="8" width="12" height="8"/>
  </objectgroup>
 </tile>
 <tile id="44">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="32" height="16"/>
  </objectgroup>
 </tile>
 <tile id="45">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="12" height="16"/>
   <object id="2" type="solid" x="12" y="20" width="4" height="12"/>
  </objectgroup>
 </tile>
 <tile id="46">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="16" width="16" height="16"/>
  </objectgroup>
 </tile>
 <tile id="47">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="2"/>
   <property name="wang" value="1,1,1,1"/>
  </properties>
 </tile>
 <tile id="48">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="32"/>
  </objectgroup>
 </tile>
 <tile id="49">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="8"/>
   <object id="3" type="solid" x="0" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="50">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="8" y="16" width="24" height="4"/>
   <object id="3" type="solid" x="12" y="20" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="24" width="16" height="8"/>
  </objectgroup>
 </tile>
 <tile id="51">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="32" height="16"/>
   <object id="2" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="52">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="16" y="12" width="8" height="20"/>
   <object id="3" type="solid" x="24" y="16" width="8" height="16"/>
  </objectgroup>
 </tile>
 <tile id="53">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="24"/>
   <object id="3" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="4" type="solid" x="16" y="16" width="4" height="4"/>
  </objectgroup>
 </tile>
 <tile id="54">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="8"/>
   <object id="3" type="solid" x="12" y="16" width="20" height="4"/>
   <object id="4" type="solid" x="16" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="55">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="0,1,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="0" y="8" width="12" height="4"/>
   <object id="3" type="solid" x="0" y="12" width="8" height="4"/>
  </objectgroup>
 </tile>
 <tile id="56">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,0,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
   <object id="2" type="solid" x="12" y="12" width="4" height="20"/>
   <object id="3" type="solid" x="0" y="16" width="12" height="16"/>
  </objectgroup>
 </tile>
 <tile id="57">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,0,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="16"/>
   <object id="2" type="solid" x="0" y="16" width="20" height="4"/>
   <object id="3" type="solid" x="0" y="20" width="16" height="12"/>
  </objectgroup>
 </tile>
 <tile id="58">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,0,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="32"/>
  </objectgroup>
 </tile>
 <tile id="59">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,0,1,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="0" width="16" height="8"/>
   <object id="2" type="solid" x="20" y="8" width="12" height="8"/>
  </objectgroup>
 </tile>
 <tile id="60">
  <properties>
   <property name="walkable" type="bool" value="false"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,1,0,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="32" height="16"/>
  </objectgroup>
 </tile>
 <tile id="61">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,1,0,1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="0" y="16" width="12" height="16"/>
   <object id="2" type="solid" x="12" y="20" width="4" height="12"/>
  </objectgroup>
 </tile>
 <tile id="62">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,1,1,0"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" type="solid" x="16" y="16" width="16" height="16"/>
  </objectgroup>
 </tile>
 <tile id="63">
  <properties>
   <property name="walkable" type="bool" value="true"/>
   <property name="variant" type="int" value="3"/>
   <property name="wang" value="1,1,1,1"/>
  </properties>
 </tile>
 <wangsets>
  <wangset name="marsh-water-wang16" type="corner" tile="-1">
   <wangcolor name="water" color="#5aa344" tile="-1" probability="1"/>
   <wangcolor name="marsh" color="#3b5dc9" tile="-1" probability="1"/>
   <wangtile tileid="0" wangid="0,1,0,1,0,1,0,1"/>
   <wangtile tileid="1" wangid="0,1,0,2,0,1,0,1"/>
   <wangtile tileid="2" wangid="0,1,0,1,0,2,0,1"/>
   <wangtile tileid="3" wangid="0,1,0,2,0,2,0,1"/>
   <wangtile tileid="4" wangid="0,2,0,1,0,1,0,1"/>
   <wangtile tileid="5" wangid="0,2,0,2,0,1,0,1"/>
   <wangtile tileid="6" wangid="0,2,0,1,0,2,0,1"/>
   <wangtile tileid="7" wangid="0,2,0,2,0,2,0,1"/>
   <wangtile tileid="8" wangid="0,1,0,1,0,1,0,2"/>
   <wangtile tileid="9" wangid="0,1,0,2,0,1,0,2"/>
   <wangtile tileid="10" wangid="0,1,0,1,0,2,0,2"/>
   <wangtile tileid="11" wangid="0,1,0,2,0,2,0,2"/>
   <wangtile tileid="12" wangid="0,2,0,1,0,1,0,2"/>
   <wangtile tileid="13" wangid="0,2,0,2,0,1,0,2"/>
   <wangtile tileid="14" wangid="0,2,0,1,0,2,0,2"/>
   <wangtile tileid="15" wangid="0,2,0,2,0,2,0,2"/>
   <wangtile tileid="16" wangid="0,1,0,1,0,1,0,1"/>
   <wangtile tileid="17" wangid="0,1,0,2,0,1,0,1"/>
   <wangtile tileid="18" wangid="0,1,0,1,0,2,0,1"/>
   <wangtile tileid="19" wangid="0,1,0,2,0,2,0,1"/>
   <wangtile tileid="20" wangid="0,2,0,1,0,1,0,1"/>
   <wangtile tileid="21" wangid="0,2,0,2,0,1,0,1"/>
   <wangtile tileid="22" wangid="0,2,0,1,0,2,0,1"/>
   <wangtile tileid="23" wangid="0,2,0,2,0,2,0,1"/>
   <wangtile tileid="24" wangid="0,1,0,1,0,1,0,2"/>
   <wangtile tileid="25" wangid="0,1,0,2,0,1,0,2"/>
   <wangtile tileid="26" wangid="0,1,0,1,0,2,0,2"/>
   <wangtile tileid="27" wangid="0,1,0,2,0,2,0,2"/>
   <wangtile tileid="28" wangid="0,2,0,1,0,1,0,2"/>
   <wangtile tileid="29" wangid="0,2,0,2,0,1,0,2"/>
   <wangtile tileid="30" wangid="0,2,0,1,0,2,0,2"/>
   <wangtile tileid="31" wangid="0,2,0,2,0,2,0,2"/>
   <wangtile tileid="32" wangid="0,1,0,1,0,1,0,1"/>
   <wangtile tileid="33" wangid="0,1,0,2,0,1,0,1"/>
   <wangtile tileid="34" wangid="0,1,0,1,0,2,0,1"/>
   <wangtile tileid="35" wangid="0,1,0,2,0,2,0,1"/>
   <wangtile tileid="36" wangid="0,2,0,1,0,1,0,1"/>
   <wangtile tileid="37" wangid="0,2,0,2,0,1,0,1"/>
   <wangtile tileid="38" wangid="0,2,0,1,0,2,0,1"/>
   <wangtile tileid="39" wangid="0,2,0,2,0,2,0,1"/>
   <wangtile tileid="40" wangid="0,1,0,1,0,1,0,2"/>
   <wangtile tileid="41" wangid="0,1,0,2,0,1,0,2"/>
   <wangtile tileid="42" wangid="0,1,0,1,0,2,0,2"/>
   <wangtile tileid="43" wangid="0,1,0,2,0,2,0,2"/>
   <wangtile tileid="44" wangid="0,2,0,1,0,1,0,2"/>
   <wangtile tileid="45" wangid="0,2,0,2,0,1,0,2"/>
   <wangtile tileid="46" wangid="0,2,0,1,0,2,0,2"/>
   <wangtile tileid="47" wangid="0,2,0,2,0,2,0,2"/>
   <wangtile tileid="48" wangid="0,1,0,1,0,1,0,1"/>
   <wangtile tileid="49" wangid="0,1,0,2,0,1,0,1"/>
   <wangtile tileid="50" wangid="0,1,0,1,0,2,0,1"/>
   <wangtile tileid="51" wangid="0,1,0,2,0,2,0,1"/>
   <wangtile tileid="52" wangid="0,2,0,1,0,1,0,1"/>
   <wangtile tileid="53" wangid="0,2,0,2,0,1,0,1"/>
   <wangtile tileid="54" wangid="0,2,0,1,0,2,0,1"/>
   <wangtile tileid="55" wangid="0,2,0,2,0,2,0,1"/>
   <wangtile tileid="56" wangid="0,1,0,1,0,1,0,2"/>
   <wangtile tileid="57" wangid="0,1,0,2,0,1,0,2"/>
   <wangtile tileid="58" wangid="0,1,0,1,0,2,0,2"/>
   <wangtile tileid="59" wangid="0,1,0,2,0,2,0,2"/>
   <wangtile tileid="60" wangid="0,2,0,1,0,1,0,2"/>
   <wangtile tileid="61" wangid="0,2,0,2,0,1,0,2"/>
   <wangtile tileid="62" wangid="0,2,0,1,0,2,0,2"/>
   <wangtile tileid="63" wangid="0,2,0,2,0,2,0,2"/>
  </wangset>
 </wangsets>
</tileset>

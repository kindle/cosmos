from astropy.coordinates import SkyCoord, EarthLocation, AltAz
from astropy.time import Time
import astropy.units as u


ra_deg = 279.23473479  # Vega的赤经
dec_deg = 38.78368896  # Vega的赤纬
lat_deg = 40.7128  # 观测者纬度 (纽约市)
lon_deg = -74.0060  # 观测者经度 (纽约市)    

# 星的赤道坐标 (例子)
coord = SkyCoord(ra=ra_deg*u.deg, dec=dec_deg*u.deg, frame='icrs')

# 观测者位置
loc = EarthLocation(lat=lat_deg*u.deg, lon=lon_deg*u.deg, height=0*u.m)

# 观测时间
t = Time("2026-02-20 12:00:00")  # UTC

altaz_frame = AltAz(obstime=t, location=loc)
altaz = coord.transform_to(altaz_frame)

print(altaz.alt.deg, altaz.az.deg)  # 跟地平面相关的高度/方位
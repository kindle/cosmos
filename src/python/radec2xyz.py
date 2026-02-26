from astropy.coordinates import SkyCoord
import astropy.units as u

# Example: Coordinates of Vega (RA: 279.23473479 degrees, Dec: +38.78368896 degrees)
ra = 279.23473479 * u.deg
dec = 38.78368896 * u.deg

# Create SkyCoord object
star_coord = SkyCoord(ra, dec, frame='icrs')

# Get Cartesian coordinates (x, y, z) for the observer location (Earth)
# Assume the observer is at the origin (0, 0, 0)
x, y, z = star_coord.cartesian.xyz.value  # Extract the scalar values from Quantity objects

# Print Cartesian coordinates
print("Star's Cartesian coordinates (x, y, z):")
print("x =", x)
print("y =", y)
print("z =", z)
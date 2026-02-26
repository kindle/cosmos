from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Capricornus star names to precise ICRS positions via SIMBAD
names = [
    "Alpha1 Cap",
    "Alpha2 Cap",
    "Beta Cap",
    "Gamma Cap",
    "Delta Cap",
    "Epsilon Cap",
    "Zeta Cap",
    "Eta Cap",
    "Theta Cap",
    "Iota Cap",
    "Kappa Cap",
    "Lambda Cap",
    "Mu Cap",
    "Nu Cap",
    "Xi Cap",
    "Omicron Cap",
    "Pi Cap",
    "Rho Cap",
    "Sigma Cap",
    "Tau Cap",
    "Upsilon Cap",
    "Phi Cap",
    "Chi Cap",
    "Psi Cap",
    "Omega Cap",
    "24 Cap",
    "36 Cap",
    "46 Cap"
]

fetch_and_print_star_data(names)
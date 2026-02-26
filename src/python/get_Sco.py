from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve (Scorpius) star names to precise ICRS positions via SIMBAD
names = [
    "Alpha Sco",   # Antares
    "Beta Sco",    # Acrab / Graffias
    "Delta Sco",   # Dschubba
    "Epsilon Sco", # Larawag
    "Zeta1 Sco",
    "Zeta2 Sco",
    "Eta Sco",
    "Theta Sco",   # Sargas
    "Iota1 Sco",
    "Iota2 Sco",
    "Kappa Sco",   # Girtab
    "Lambda Sco",  # Shaula
    "Mu1 Sco",
    "Mu2 Sco",     # Pipirima
    "Nu Sco",      # Jabbah
    "Xi Sco",
    "Omicron Sco",
    "Pi Sco",      # Fang
    "Rho Sco",     # Iklil
    "Sigma Sco",   # Alniyat
    "Tau Sco",     # Paikauhale
    "Upsilon Sco", # Lesath
    "Chi Sco",
    "Psi Sco",
    "Omega1 Sco",
    "Omega2 Sco",
    "18 Sco",      # Solar twin
    "U Sco",       # Recurrent nova
    "BM Sco",      # Brightest star in M6
]

fetch_and_print_star_data(names)

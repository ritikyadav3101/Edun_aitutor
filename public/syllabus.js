const NCERT_SYLLABUS = {
  '12th CBSE': {
    'Physics': {
      chapters: [
        {name:'Chapter 1 - Electric Charges and Fields', topics:['Electric charge','Coulombs law','Electric field','Gauss law','Electric dipole']},
        {name:'Chapter 2 - Electrostatic Potential', topics:['Electric potential','Equipotential surfaces','Capacitors','Van de Graaff generator']},
        {name:'Chapter 3 - Current Electricity', topics:['Electric current','Ohms law','Kirchhoffs laws','Wheatstone bridge','Meter bridge']},
        {name:'Chapter 4 - Moving Charges', topics:['Magnetic force','Cyclotron','Biot Savart law','Amperes law','Solenoid']},
        {name:'Chapter 5 - Magnetism', topics:['Bar magnet','Earths magnetism','Magnetic materials','Hysteresis']},
        {name:'Chapter 6 - Electromagnetic Induction', topics:['Faradays laws','Lenzs law','Eddy currents','Inductance','AC generator']},
        {name:'Chapter 7 - Alternating Current', topics:['AC voltage','Phasors','LC oscillations','Transformers','Power factor']},
        {name:'Chapter 8 - Electromagnetic Waves', topics:['Displacement current','EM spectrum','Properties of EM waves']},
        {name:'Chapter 9 - Ray Optics', topics:['Reflection','Refraction','TIR','Prism','Optical instruments']},
        {name:'Chapter 10 - Wave Optics', topics:['Huygen principle','Interference','Diffraction','Polarisation']},
        {name:'Chapter 11 - Dual Nature', topics:['Photoelectric effect','de Broglie wavelength','Davisson Germer']},
        {name:'Chapter 12 - Atoms', topics:['Rutherford model','Bohr model','Hydrogen spectrum','Energy levels']},
        {name:'Chapter 13 - Nuclei', topics:['Nuclear binding energy','Radioactivity','Nuclear fission','Nuclear fusion']},
        {name:'Chapter 14 - Semiconductors', topics:['p-n junction','Diode','Transistor','Logic gates']}
      ]
    },
Chemistry': {
      chapters: [
        {name:'Chapter 1 - Solid State', topics:['Crystal systems','Packing efficiency','Defects','Properties']},
        {name:'Chapter 2 - Solutions', topics:['Types of solutions','Raoults law','Colligative properties','Van t Hoff factor']},
        {name:'Chapter 3 - Electrochemistry', topics:['Electrochemical cells','Nernst equation','Kohlrausch law','Batteries','Corrosion']},
        {name:'Chapter 4 - Chemical Kinetics', topics:['Rate of reaction','Order','Arrhenius equation','Catalysis']},
        {name:'Chapter 5 - Surface Chemistry', topics:['Adsorption','Colloids','Emulsions','Catalysis types']},
        {name:'Chapter 6 - General Principles', topics:['Metallurgy','Extraction methods','Refining']},
        {name:'Chapter 7 - p Block Elements', topics:['Group 15','Group 16','Group 17','Group 18','Important compounds']},
        {name:'Chapter 8 - d and f Block', topics:['Transition metals','Lanthanoids','Actinoids','Properties']},
        {name:'Chapter 9 - Coordination', topics:['Werner theory','IUPAC naming','Isomerism','CFT','Applications']},
        {name:'Chapter 10 - Haloalkanes', topics:['Preparation','Properties','SN1 SN2','Optical activity']},
        {name:'Chapter 11 - Haloarenes', topics:['Preparation','Electrophilic substitution','Reactions']},
        {name:'Chapter 12 - Alcohols Phenols', topics:['Preparation','Chemical properties','Ether preparation']},
        {name:'Chapter 13 - Aldehydes Ketones', topics:['Preparation','Nucleophilic addition','Aldol condensation']},
        {name:'Chapter 14 - Carboxylic Acids', topics:['Preparation','Reactions','Derivatives']},
        {name:'Chapter 15 - Amines', topics:['Classification','Preparation','Basicity','Reactions','Diazonium salts']},
        {name:'Chapter 16 - Biomolecules', topics:['Carbohydrates','Proteins','Enzymes','Vitamins','Nucleic acids']}
      ]
    },
Biology': {
      chapters: [
        {name:'Chapter 1 - Reproduction in Organisms', topics:['Asexual reproduction','Sexual reproduction','Life span']},
        {name:'Chapter 2 - Sexual Reproduction Flowering Plants', topics:['Flower structure','Pollination','Fertilization','Seeds fruits']},
        {name:'Chapter 3 - Human Reproduction', topics:['Male reproductive system','Female reproductive system','Gametogenesis','Fertilization','Embryo development']},
        {name:'Chapter 4 - Reproductive Health', topics:['Population explosion','Birth control','STDs','MTP','Infertility']},
        {name:'Chapter 5 - Principles of Inheritance', topics:['Mendels laws','Incomplete dominance','Codominance','Blood groups','Chromosomal theory']},
        {name:'Chapter 6 - Molecular Basis of Inheritance', topics:['DNA structure','Replication','Transcription','Translation','Genetic code']},
        {name:'Chapter 7 - Evolution', topics:['Origin of life','Darwin theory','Natural selection','Hardy Weinberg','Human evolution']},
        {name:'Chapter 8 - Human Health Disease', topics:['Immunity','AIDS','Cancer','Drugs alcohol']},
        {name:'Chapter 9 - Strategies for Enhancement', topics:['Animal breeding','Plant breeding','Biofortification','SCP']},
        {name:'Chapter 10 - Microbes in Human Welfare', topics:['Household products','Industrial products','Sewage treatment','Biogas','Biocontrol']},
        {name:'Chapter 11 - Biotechnology Principles', topics:['Recombinant DNA','Restriction enzymes','Cloning vectors','PCR','Electrophoresis']},
        {name:'Chapter 12 - Biotechnology Applications', topics:['GM organisms','Insulin','Gene therapy','Molecular diagnosis']},
        {name:'Chapter 13 - Organisms and Populations', topics:['Habitat niche','Population attributes','Population growth','Interactions']},
        {name:'Chapter 14 - Ecosystem', topics:['Productivity','Decomposition','Energy flow','Nutrient cycling']},
        {name:'Chapter 15 - Biodiversity', topics:['Types of biodiversity','Patterns','Importance','Loss','Conservation']},
        {name:'Chapter 16 - Environmental Issues', topics:['Air pollution','Water pollution','Solid waste','Greenhouse effect','Ozone depletion']}
      ]
    }
  },  '10th CBSE': {
    'Mathematics': {
      chapters: [
        {name:'Chapter 1 - Real Numbers', topics:['Euclids algorithm','Fundamental theorem','Irrational numbers','Decimal expansions']},
        {name:'Chapter 2 - Polynomials', topics:['Zeros of polynomial','Relationship between zeros','Division algorithm']},
        {name:'Chapter 3 - Linear Equations', topics:['Graphical method','Substitution','Elimination','Cross multiplication']},
        {name:'Chapter 4 - Quadratic Equations', topics:['Standard form','Factorisation','Completing square','Quadratic formula','Discriminant']},
        {name:'Chapter 5 - Arithmetic Progressions', topics:['nth term','Sum of AP','Applications']},
        {name:'Chapter 6 - Triangles', topics:['Similar triangles','Basic proportionality','Pythagoras theorem','Areas of similar triangles']},
        {name:'Chapter 7 - Coordinate Geometry', topics:['Distance formula','Section formula','Area of triangle','Midpoint']},
        {name:'Chapter 8 - Introduction to Trigonometry', topics:['Trigonometric ratios','Specific angles','Complementary angles','Identities']},
        {name:'Chapter 9 - Applications of Trigonometry', topics:['Heights and distances','Angle of elevation','Angle of depression']},
        {name:'Chapter 10 - Circles', topics:['Tangent to circle','Number of tangents','Lengths of tangents']},
        {name:'Chapter 11 - Constructions', topics:['Division of line segment','Tangents to circle','Similar triangles']},
        {name:'Chapter 12 - Areas Related to Circles', topics:['Perimeter area circle','Area of sector','Area of segment']},
        {name:'Chapter 13 - Surface Areas Volumes', topics:['Combination of solids','Conversion of solids','Frustum']},
        {name:'Chapter 14 - Statistics', topics:['Mean','Median','Mode','Cumulative frequency','Ogive']},
        {name:'Chapter 15 - Probability', topics:['Classical probability','Simple problems']}
      ]
    },
    'Science': {
      chapters: [
        {name:'Chapter 1 - Chemical Reactions', topics:['Types of reactions','Combination','Decomposition','Displacement','Redox']},
        {name:'Chapter 2 - Acids Bases Salts', topics:['Properties','pH scale','Neutralisation','Salts','Common indicators']},
        {name:'Chapter 3 - Metals and Non-metals', topics:['Physical properties','Chemical properties','Reactivity series','Extraction','Corrosion']},
        {name:'Chapter 4 - Carbon Compounds', topics:['Covalent bonding','Versatile nature','Homologous series','Important compounds','Soaps detergents']},
        {name:'Chapter 5 - Periodic Classification', topics:['Early attempts','Mendeleev table','Modern periodic law','Trends']},
        {name:'Chapter 6 - Life Processes', topics:['Nutrition','Respiration','Transportation','Excretion']},
        {name:'Chapter 7 - Control and Coordination', topics:['Nervous system','Reflex action','Hormones','Endocrine glands']},
        {name:'Chapter 8 - How do Organisms Reproduce', topics:['Asexual reproduction','Sexual reproduction in plants','Human reproductive system']},
        {name:'Chapter 9 - Heredity and Evolution', topics:['Heredity','Mendels experiments','Sex determination','Evolution','Speciation']},
        {name:'Chapter 10 - Light Reflection', topics:['Laws of reflection','Mirror formula','Magnification','Concave convex mirrors']},
        {name:'Chapter 11 - Human Eye', topics:['Structure','Power of accommodation','Defects','Refraction through prism']},
        {name:'Chapter 12 - Electricity', topics:['Electric current','Ohms law','Resistance','Series parallel','Heating effect']},
        {name:'Chapter 13 - Magnetic Effects', topics:['Magnetic field','Oersteds experiment','Force on conductor','Electric motor','Electromagnetic induction']},
        {name:'Chapter 14 - Sources of Energy', topics:['Conventional sources','Non-conventional','Nuclear energy','Environmental impact']},
        {name:'Chapter 15 - Our Environment', topics:['Ecosystem','Food chain','Ozone layer','Waste management']},
        {name:'Chapter 16 - Management of Natural Resources', topics:['Conservation','Three Rs','Forest resources','Water resources','Coal petroleum']}
      ]
    }
  },
 'SSC CGL': {
    'General Intelligence': {
      chapters: [
        {name:'Verbal Reasoning', topics:['Analogy','Classification','Series','Coding decoding','Blood relations','Direction sense']},
        {name:'Non-verbal Reasoning', topics:['Pattern completion','Mirror images','Paper folding','Embedded figures','Figure matrix']},
        {name:'Logical Reasoning', topics:['Syllogism','Statement conclusions','Assumptions','Cause effect','Course of action']}
      ]
    },
    'Quantitative Aptitude': {
      chapters: [
        {name:'Number System', topics:['LCM HCF','Fractions','Decimals','Surds indices','Number series']},
        {name:'Algebra', topics:['Linear equations','Quadratic equations','Identities','Polynomials']},
        {name:'Geometry', topics:['Triangles','Circles','Quadrilaterals','Coordinate geometry']},
        {name:'Trigonometry', topics:['Ratios','Identities','Heights distances','Complementary angles']},
        {name:'Mensuration', topics:['2D shapes','3D shapes','Area perimeter','Volume surface area']},
        {name:'Data Interpretation', topics:['Bar graphs','Pie charts','Line graphs','Tables','Mixed DI']},
        {name:'Arithmetic', topics:['Percentage','Profit loss','SI CI','Time work','Time distance','Ratio proportion']}
      ]
    }
  },
  'NEET': {
    'Physics': {
      chapters: [
        {name:'Mechanics', topics:['Kinematics','Laws of motion','Work energy power','Rotational motion','Gravitation']},
        {name:'Thermodynamics', topics:['Thermal properties','Thermodynamics laws','Kinetic theory','Heat transfer']},
        {name:'Electrostatics', topics:['Electric charges','Coulombs law','Electric field','Potential','Capacitors']},
        {name:'Current Electricity', topics:['Ohms law','Kirchhoffs laws','Wheatstone bridge','Potentiometer']},
        {name:'Optics', topics:['Ray optics','Wave optics','Interference','Diffraction','Optical instruments']},
        {name:'Modern Physics', topics:['Dual nature','Atoms','Nuclei','Semiconductors']}
      ]
    },
    'Chemistry': {
      chapters: [
        {name:'Physical Chemistry', topics:['Mole concept','Atomic structure','Chemical bonding','States of matter','Thermodynamics','Equilibrium','Electrochemistry','Kinetics']},
        {name:'Organic Chemistry', topics:['Basic concepts','Hydrocarbons','Haloalkanes','Alcohols','Aldehydes','Carboxylic acids','Amines','Biomolecules']},
        {name:'Inorganic Chemistry', topics:['Periodic table','s block','p block','d block','Coordination compounds','Metallurgy']}
      ]
    },
    'Biology': {
      chapters: [
        {name:'Diversity in Living World', topics:['Classification','Kingdoms','Monera Protista Fungi','Plant kingdom','Animal kingdom']},
        {name:'Structural Organisation', topics:['Cell biology','Biomolecules','Cell cycle','Plant anatomy','Animal tissues']},
        {name:'Plant Physiology', topics:['Transport','Mineral nutrition','Photosynthesis','Respiration','Growth hormones']},
        {name:'Human Physiology', topics:['Digestion','Breathing','Body fluids','Circulation','Excretion','Locomotion','Neural control','Chemical coordination']},
        {name:'Reproduction', topics:['Plant reproduction','Human reproduction','Reproductive health']},
        {name:'Genetics Evolution', topics:['Principles of inheritance','Molecular basis','Evolution']},
        {name:'Biology in Human Welfare', topics:['Human health','Improvement in food','Microbes','Biotechnology','Ecology']}
      ]
    }
  },
  'JEE': {
    'Physics': {
      chapters: [
        {name:'Mechanics', topics:['Kinematics 1D 2D','Newtons laws','Friction','Work energy','Circular motion','Rotational mechanics','Gravitation','SHM','Waves']},
        {name:'Thermodynamics', topics:['Thermal expansion','Calorimetry','Kinetic theory','Thermodynamic processes','Heat engines']},
        {name:'Electrostatics', topics:['Coulombs law','Electric field','Gauss law','Potential','Capacitors','Dielectrics']},
        {name:'Current Electricity', topics:['Ohms law','Cells EMF','Kirchhoffs laws','Potentiometer','Galvanometer']},
        {name:'Magnetic Effects', topics:['Biot Savart','Amperes law','Force on charges','Electromagnetic induction','AC circuits']},
        {name:'Optics', topics:['Geometrical optics','Wave optics','Interference','Diffraction']},
        {name:'Modern Physics', topics:['Photoelectric effect','de Broglie','Bohrs model','Nuclear physics','Semiconductors']}
      ]
    },
    'Chemistry': {
      chapters: [
        {name:'Physical Chemistry', topics:['Atomic structure','Chemical bonding','States of matter','Thermodynamics','Equilibrium','Electrochemistry','Chemical kinetics','Surface chemistry']},
        {name:'Organic Chemistry', topics:['GOC','Isomerism','Hydrocarbons','Stereochemistry','Reaction mechanisms','Named reactions','Biomolecules','Polymers']},
        {name:'Inorganic Chemistry', topics:['Periodic properties','s block','p block','d block','f block','Coordination chemistry','Qualitative analysis']}
      ]
    },
    'Mathematics': {
      chapters: [
        {name:'Algebra', topics:['Complex numbers','Quadratic equations','Sequences series','Permutations combinations','Binomial theorem','Matrices determinants']},
        {name:'Calculus', topics:['Limits continuity','Differentiation','Applications of derivatives','Integration','Definite integrals','Differential equations']},
        {name:'Coordinate Geometry', topics:['Straight lines','Circles','Parabola','Ellipse','Hyperbola','3D geometry']},
        {name:'Trigonometry', topics:['Trigonometric functions','Equations','Inverse trigonometry','Properties of triangles']},
        {name:'Vectors Statistics', topics:['Vector algebra','Probability','Statistics']}
      ]
    }
  },
  'CUET': {
    'General Test': {
      chapters: [
        {name:'Numerical Ability', topics:['Number system','Algebra','Geometry','Mensuration','Data interpretation','Arithmetic']},
        {name:'Logical Reasoning', topics:['Verbal reasoning','Non-verbal reasoning','Critical thinking','Puzzles']},
        {name:'General Knowledge', topics:['History','Geography','Polity','Economics','Science technology','Current affairs']},
        {name:'Language Skills', topics:['Reading comprehension','Grammar','Vocabulary','Writing skills']}
      ]
    }
  }
};

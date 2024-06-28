# TestMyBrain Cognitive Test Code
​
​
## Summary


This repository contains the open source code for TestMyBrain cognitive tests. TestMyBrain is a collaboration between the Laboratory for Brain and Cognitive Health Technology at McLean Hospital (https://www.cognitivehealth.tech) and the Many Brains Project (https://www.manybrains.net), a 501c3 nonprofit. To ensure that the cognitive tests we develop can be used as widely as possible they are distributed under an open source license (GNU LGPLv3). You may use our code provided you follow the terms of the license as described in the “License” section below.


Please give appropriate credit in all publications related to the TestMyBrain tests by including the following paragraph and references:


The TestMyBrain cognitive tests adopted in this publication were developed for web administration by the Many Brains Project in collaboration with the Laboratory for Brain and Cognitive Health Technology at McLean Hospital.


References: 


1. Germine, L., Nakayama, K., Duchaine, B. C., Chabris, C. F., Chatterjee, G., & Wilmer, J. B. (2012). Is the Web as good as the lab? Comparable performance from Web and lab in cognitive/perceptual experiments. Psychonomic Bulletin & Review, 19(5), 847-857.


2. The Many Brains Project. TestMyBrain Cognitive Tests. URL: www.manybrains.net




## Getting Started
​
### Dependencies
​
The cognitive tests available in this repository are intended to be administered on the web and require a web server for hosting all the included files




### Folder Structure






Each cognitive test is stored in a separate folder. Each test folder may contain the following:
* A docs folder:
   * Data dictionary explaining the data collected by the test: .xlsx file
   * Task overviews (with references/acknowledgements)
* A src folder:
   * Cognitive test code: these will be a combination of .html and .css files that are specific to the individual cognitive tests
   * Support code: .js files that support cognitive tests, which may be found across multiple test folders. Minified versions of the TestMyBrain library (TestMyBrain.12.18.min.js) are contained within each cognitive test folder. A non-minified, readable version is available in the TMB_Library folder (TestMyBrain_GitHub.12.18.js).
   * Text (.txt) files used as input for the test
   * image files used in the test


​
### Installing
​
Deploy the source files using any standardized process to a web server.
​
​
​## Contact


If you are in need of technical infrastructure for administering these tests, please contact info@manybrains.net.
​
## License


The cognitive test code and the TestMyBrain.js library are distributed under a GNU LGPLv3 license:


This license allows the code from the cognitive tests to be used and redistributed for any purpose, with any modifications, as long as appropriate credit is given, a link to the license is included, and clear indication if changes were made. Critically, any derivatives of the code must retain the original GNU LGPLv3 license. This ensures that all software derivatives remain open source. Based on this license, you may not apply any legal terms or technological measures that legally restrict others from doing anything the license permits.


Required Copyright Language:
Any use of the software must include the following statements in the following locations: (1) in the code itself and (2) in any materials that accompany its use and distribution.


For cognitive test code:
Copyright 2024 by The Many Brains Project, Inc. and McLean Hospital. This code is made available under a GNU Lesser General Public License 3.0 (GNU LGPLv3).https://www.gnu.org/licenses/lgpl-3.0.en.html. This script may be shared, with appropriate credit, and reasonable indication of any changes that were made. If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.


For the TestMyBrain.js library:
Copyright 2024 by The Many Brains Project, Inc. This code is made available under a GNU Lesser General Public License 3.0 (GNU LGPLv3).
https://www.gnu.org/licenses/lgpl-3.0.en.html. The script may be used and shared, with appropriate credit, but any modified versions of this code must be made available under the same GNU LGPLv3 license.


TestMyBrain.js may include other code under MIT license, please see therein.


For stimuli:
All stimuli (including images) are under a CC-BY-SA 4.0 license, unless stated otherwise in the test’s task overview. Please see individual test documentation for stimuli specific attribution.
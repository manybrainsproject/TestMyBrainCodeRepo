# TestMyBrain Cognitive Test Code
​
​
## Summary


This repository contains the open source code for TestMyBrain cognitive tests. TestMyBrain is a collaboration between the Division of Brain and Cognitive Health Technology in the Department of Neurology at the Albert Einstein College of Medicine and the Many Brains Project (https://www.manybrains.net), a 501(c)(3) nonprofit. To ensure that the cognitive tests we develop can be used as widely as possible, they are distributed under an open source license (GNU LGPLv3). You may use our code provided you follow the terms of the license as described in the “License” section below.


Please give appropriate credit in all publications related to the TestMyBrain tests by including the following paragraph and references:


The TestMyBrain cognitive tests adopted in this publication were developed for web administration by the Many Brains Project in collaboration with the Laboratory for Brain and Cognitive Health Technology at McLean Hospital.


References: 


1. Germine, L., Nakayama, K., Duchaine, B. C., Chabris, C. F., Chatterjee, G., & Wilmer, J. B. (2012). Is the Web as good as the lab? Comparable performance from Web and lab in cognitive/perceptual experiments. Psychonomic Bulletin & Review, 19(5), 847-857.


2. The Many Brains Project. TestMyBrain Cognitive Tests. URL: www.manybrains.net

## Code Availability

All test code currently available for download is provided in this repository. Updated versions of existing tests, as well as additional tests, will be added here as they are prepared for public release.

We are unable to provide code or respond to inquiries regarding legacy tests that are no longer supported and/or tests that are not yet publicly available in this repository.

## Getting Started
### Dependencies

The cognitive tests available in this repository are intended to be administered on the web and require a web server for hosting all the included files.

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

### Installing
​
Deploy the source files using any standardized process to a web server.

### Scientific Validity of External Implementations

Changes to TestMyBrain cognitive tests, including modifications to instructions, stimuli, language, timing, scoring, or input methods (e.g., touchscreen, mouse, or keyboard), may affect test performance and the applicability of existing normative data. Even when the original code is used without modification, differences in hosting environments or device configurations may affect results.

Organizations implementing TMB tests independently are responsible for evaluating the validity of their implementations. Many Brains does not provide technical support, equivalence testing, or scientific validation for independently hosted or modified implementations. 

### Clinical Use

TestMyBrain cognitive tests are developed primarily for research purposes and are not designed or validated as clinical diagnostic tools.

If you use TMB tests for clinical screening, diagnosis, treatment planning, or monitoring individual patients, you are responsible for ensuring that the tests are appropriate and validated for your intended use and that you meet any applicable clinical and regulatory requirements.

The availability of TMB tests through this repository does not imply that Many Brains endorses or validates their use for clinical decision-making.

### Funding Acknowledgment

The Many Brains Project is a partner in the Open Measures Network Initiative for Alzheimer's Disease and Related Dementias (OMNI ADRD - https://omni-adrd.org/), supported by the National Institute on Aging (NIA) through NIH grant U24AG092760. Through this initiative, Many Brains is advancing the development and improvement of digital cognitive assessments and research infrastructure, including new tools and resources that will be made publicly available through our GitHub repositories.

## Contact

If you are in need of technical infrastructure for administering these tests, please contact info@manybrains.net.


## License

The cognitive test code and the TestMyBrain.js library are distributed under a GNU LGPLv3 license:


This license allows the code from the cognitive tests to be used and redistributed for any purpose, with any modifications, as long as appropriate credit is given, a link to the license is included, and clear indication if changes were made. Critically, any modifications to the code must retain the original GNU LGPLv3 license. This ensures that all software derivatives remain open source. Based on this license, you may not apply any legal terms or technological measures that legally restrict others from doing anything the license permits.


Required Copyright Language:
Any use of the software must include the following statements in the following locations: (1) in the code itself and (2) in any materials that accompany its use and distribution.


For cognitive test code:
Copyright 2024 by The Many Brains Project, Inc. and McLean Hospital. This code is made available under a GNU Lesser General Public License 3.0 (GNU LGPLv3 - https://www.gnu.org/licenses/lgpl-3.0.en.html). These scripts may be shared, with appropriate credit, and reasonable indication of any changes that were made. If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.


Certain JavaScript files may include other code under the MIT license, please see therein.


For stimuli:
All stimuli (including images) are under a CC-BY-SA 4.0 license, unless stated otherwise in the test’s task overview. Please see individual test documentation for stimuli specific attribution.

ML.addChapter({
    id: 5,
    title: 'Supervised Learning',
    short: 'Supervised Learning',
    lecture: 'Lectures 6–7',
    color: '#0d9488',
    blurb: 'Regression (linear, polynomial, multiple, logistic), decision trees & Gini, random forest, SVM, Naïve Bayes, KNN and neural networks.',
    outcomes: [
        'Explain supervised learning and distinguish classification from regression',
        'Apply linear, polynomial, multiple and logistic regression',
        'Build decision trees using the Gini index; explain random forests',
        'Explain SVM hyperplanes, margins, soft margins and kernels',
        'Classify with Naïve Bayes and KNN by hand',
        'Describe artificial neural networks, activation and backpropagation'
    ],
    topics: [
        {
            id: 'intro', title: 'What supervised learning is',
            html: String.raw`
<p class="lead">Supervised algorithms learn from <strong>training data</strong> (samples <em>x</em>) together with known <strong>labels/responses</strong> (<em>y</em>). The goal is to learn a mapping <strong>x → y</strong> that predicts y for new, unseen x.</p>
<p>They're called <em>supervised</em> because the desired outputs are known beforehand during training, like a teacher providing the answers.</p>

<div class="flow arrows"><span>Training data + labels</span><span>Feature extraction</span><span>ML algorithm</span><span>Trained model</span></div>
<div class="flow arrows"><span>New data</span><span>Same feature extraction</span><span>Trained model</span><span>Predicted label</span></div>

<div class="vs">
<div><h5>Classification</h5><p>Predict <strong>categorical</strong> class labels: discrete and unordered. E.g. spam/ham, fraud/legit, disease yes/no, digit 0–9.</p></div>
<div><h5>Regression</h5><p>Predict <strong>continuous numeric</strong> values (value estimation). E.g. house price, temperature, CO₂ emission.</p></div>
</div>

<details class="check"><summary>Classroom activity: classification or regression? (a) Will a customer churn? (b) Tomorrow's electricity demand in MW? (c) Which of 10 objects is in a photo? (d) A student's final exam mark?</summary><div><p>(a) Classification (yes/no). (b) Regression. (c) Classification (multi-class). (d) Regression (numeric mark). If it were a grade A–F, it would be classification.</p></div></details>

<h3>Algorithms in this chapter</h3>
<div class="cards">
<div class="card click" data-nav="c5-regression"><span class="tag">Regression</span><p>Linear, polynomial, multiple, logistic</p></div>
<div class="card click" data-nav="c5-trees"><span class="tag">Trees</span><p>Decision tree, Gini, CART</p></div>
<div class="card click" data-nav="c5-forest"><span class="tag">Ensemble</span><p>Random forest</p></div>
<div class="card click" data-nav="c5-svm"><span class="tag">Margin</span><p>Support vector machine</p></div>
<div class="card click" data-nav="c5-bayes"><span class="tag">Probability</span><p>Naïve Bayes</p></div>
<div class="card click" data-nav="c5-knn"><span class="tag">Instance</span><p>K-nearest neighbours</p></div>
<div class="card click" data-nav="c5-ann"><span class="tag">Neural</span><p>Artificial neural networks</p></div>
</div>
`
        },
        {
            id: 'regression', title: 'Regression models',
            html: String.raw`
<h3>Linear regression</h3>
<p>Models the relationship between a dependent variable Y and one or more independent variables X using a <strong>best-fit straight line</strong> (the regression line):</p>
$$Y = mX + c \qquad (m=\text{slope},\ c=\text{intercept})$$

<h4>Residuals and least squares</h4>
<p>A <strong>residual</strong> is the prediction error for one point: $e_i = y_i - \hat y_i$. <strong>Ordinary least squares</strong> picks m and c to minimise the sum of squared residuals:</p>
$$\text{SSE}=\sum_{i}(y_i-\hat y_i)^2$$
<p>Squaring makes errors positive and penalises large errors more.</p>
<div class="vis" data-vis="linreg"></div>

<div class="callout ex"><span class="ttl">Worked example: study hours</span>Suppose the trained model is $\hat y = 5x + 40$ (exam score from hours studied). For x = 6 hours: $\hat y = 5(6)+40 = 70$. If the student actually scored 74, the residual is 74 − 70 = <strong>+4</strong> (the model under-predicted). Interpretation: each extra hour adds 5 marks, and 0 hours predicts 40.</div>

<h3>Multiple regression</h3>
<p>Like linear regression but with <strong>two or more independent variables</strong>: $\hat y = b_0 + b_1x_1 + b_2x_2 + \dots$. Example: predict a car's <strong>CO₂</strong> from engine <strong>Volume</strong> <em>and</em> <strong>Weight</strong>.</p>
<div class="tbl-wrap"><table class="tbl"><tr><th>Car</th><th class="num">Volume</th><th class="num">Weight</th><th class="num">CO₂</th></tr>
<tr><td>Toyota Aygo</td><td class="num">1000</td><td class="num">790</td><td class="num">99</td></tr>
<tr><td>Mitsubishi Space Star</td><td class="num">1200</td><td class="num">1160</td><td class="num">95</td></tr>
<tr><td>Skoda Citigo</td><td class="num">1000</td><td class="num">929</td><td class="num">95</td></tr>
<tr><td>Fiat 500</td><td class="num">900</td><td class="num">865</td><td class="num">90</td></tr>
<tr><td>Mini Cooper</td><td class="num">1500</td><td class="num">1140</td><td class="num">105</td></tr>
<tr><td>VW Up!</td><td class="num">1000</td><td class="num">929</td><td class="num">105</td></tr></table></div>
<pre><code>regr = linear_model.LinearRegression().fit(df[["Weight", "Volume"]], df["CO2"])
regr.predict([[2300, 1300]])</code></pre>

<h3>Polynomial regression</h3>
<p>Fits a <strong>curve</strong> for non-linear data: $\hat y = b_0 + b_1x + b_2x^2 + \dots + b_nx^n$. It's still linear in the coefficients, so it's solved with linear regression on polynomial features.</p>
<div class="vs"><div><h5>Multiple regression</h5><p>Several <em>different</em> input variables, each to power 1.</p></div><div><h5>Polynomial regression</h5><p>One variable raised to <em>several powers</em> (x, x², x³…).</p></div></div>
<div class="callout trap"><span class="ttl">Polynomial curves and overfitting</span>A low degree underfits curved data. A very high degree passes through every training point, follows the noise and generalises badly. Pick the degree that does best on <strong>validation</strong> data (try the slider in Chapter 1's fit demo).</div>

<h3>Logistic regression: a classifier, despite its name</h3>
<p>A statistical method for predicting <strong>binary</strong> (dichotomous, two-class) outcomes such as cancer yes/no or fraud/legit. It computes the <strong>probability</strong> of the event by passing a linear score through the <strong>sigmoid</strong>:</p>
$$\sigma(z)=\frac{1}{1+e^{-z}},\qquad z=b_0+b_1x_1+\dots$$
<p>σ maps any real number into (0, 1). If σ(z) ≥ 0.5, predict class 1, otherwise class 0. At z = 0, σ = 0.5.</p>
<div class="vis" data-vis="sigmoid"></div>

<div class="tbl-wrap"><table class="tbl"><tr><th>Model</th><th>Output</th><th>Shape</th></tr>
<tr><td>Linear</td><td>Continuous</td><td>Straight line</td></tr><tr><td>Multiple</td><td>Continuous</td><td>Plane / hyperplane (many inputs)</td></tr>
<tr><td>Polynomial</td><td>Continuous</td><td>Curve</td></tr><tr><td>Logistic</td><td>Probability → class</td><td>S-shaped sigmoid</td></tr></table></div>

<details class="check"><summary>Check yourself: z = 2 in logistic regression. Probability and class?</summary><div><p>σ(2) = 1/(1+e^−2) ≈ 0.881 ≥ 0.5, so <strong>class 1</strong>.</p></div></details>
`
        },
        {
            id: 'trees', title: 'Decision trees & the Gini index',
            html: String.raw`
<p class="lead">A decision tree is a tree-like structure of <strong>IF–THEN rules</strong>. Internal nodes test an attribute, branches are the test outcomes, and <strong>leaf nodes hold class labels</strong>. A path from root to leaf is a classification rule.</p>

<div class="cards">
<div class="card"><span class="tag">Root node</span><p>The topmost decision node, where the first split is made.</p></div>
<div class="card"><span class="tag">Decision (branch) node</span><p>Contains a question that splits into sub-nodes.</p></div>
<div class="card"><span class="tag">Leaf / terminal node</span><p>Doesn't split. The class is assigned by <strong>majority vote</strong>.</p></div>
</div>
<p>Example rule from the weather/play data: <em>IF outlook = sunny AND temperature is hot THEN don't play.</em> Advantage: there is <strong>no need to create dummy variables</strong>, and the rules are easy to interpret.</p>
<p><strong>CART</strong> (Classification And Regression Trees) is the term for the decision tree algorithm. The tree generator decides <em>which variable</em> to split on at each node and <em>the split value</em>, then decides whether to stop (making a leaf) or split again.</p>

<h3>How does a tree choose a split? Gini</h3>
<p>The tree picks the split whose children are the most <strong>homogeneous (pure)</strong>. Standard definition, <strong>Gini impurity</strong>:</p>
$$\text{Gini impurity} = 1-\sum_{k} p_k^2 \qquad (\text{0 = pure; lower is better})$$
<p>The lecture computes the complementary <strong>Gini score</strong> $\sum p_k^2$, where <em>higher</em> means purer. Both choose the same split, as long as you compare in the right direction.</p>

<div class="callout ex"><span class="ttl">Worked example: 30 students, who plays piano?</span>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Split</th><th>Sub-node (n)</th><th>p(play), p(not)</th><th class="num">Σp²</th><th class="num">1−Σp²</th></tr>
<tr><td rowspan="2">Gender</td><td>Female (10)</td><td>0.2, 0.8</td><td class="num">0.68</td><td class="num">0.32</td></tr>
<tr><td>Male (20)</td><td>0.65, 0.35</td><td class="num">0.545</td><td class="num">0.455</td></tr>
<tr><td rowspan="2">Plays other instrument</td><td>Yes (12)</td><td>0.42, 0.58</td><td class="num">0.51</td><td class="num">0.49</td></tr>
<tr><td>No (18)</td><td>0.56, 0.44</td><td class="num">0.51</td><td class="num">0.49</td></tr>
<tr><td rowspan="2">Class</td><td>8th grade (14)</td><td>0.43, 0.57</td><td class="num">0.51</td><td class="num">0.49</td></tr>
<tr><td>9th grade (16)</td><td>0.56, 0.44</td><td class="num">0.51</td><td class="num">0.49</td></tr>
</table></div>
<p>Weighted Gini score: Gender = (10/30)(0.68) + (20/30)(0.545) = <strong>0.59</strong>. Other instruments ≈ <strong>0.51</strong>. Class ≈ <strong>0.51</strong>.</p>
<p>Weighted Gini impurity: Gender ≈ <strong>0.41</strong>. Others ≈ <strong>0.49</strong>.</p>
<p><strong>Split on Gender</strong>: highest Σp² and lowest impurity, so it gives the purest sub-nodes.</p></div>

<div class="callout trap"><span class="ttl">Watch out: slide wording</span>The slide computes Σp² (where higher is purer) but then says to split on whichever index is <em>lower</em>, which points to "Plays other instruments / Class". That mixes the two definitions. Under either correct reading, <strong>Gender</strong> wins. In an exam, state which definition you are using and compare in the matching direction. If your lecturer expects the slide's answer, ask them which convention they want.</div>

<div class="vis" data-vis="gini"></div>

<h3>Pros and cons</h3>
<div class="vs">
<div><h5>Pros</h5><ul><li>Easy to interpret, since it gives explicit rules</li><li>Handles numeric and categorical data, with no dummy variables needed</li><li>No feature scaling needed</li><li>Captures non-linear relationships</li></ul></div>
<div><h5>Cons</h5><ul><li>Prone to <strong>overfitting</strong> (deep trees memorise noise), so prune or limit depth</li><li>Unstable: small data changes give a different tree</li><li>Greedy splits are not globally optimal</li></ul></div>
</div>
`
        },
        {
            id: 'forest', title: 'Random forest (ensemble learning)',
            html: String.raw`
<p class="lead"><strong>Ensemble learning</strong> combines different algorithms, or the same algorithm several times, into a more powerful model. A <strong>random forest</strong> combines many <strong>decision trees</strong>, hence "forest". It works for both classification and regression.</p>

<h3>Algorithm</h3>
<ol class="steps">
<li>Pick N random records from the dataset (a bootstrap sample, drawn with replacement).</li>
<li>Build a decision tree on these N records.</li>
<li>Choose the number of trees and repeat steps 1–2.</li>
<li><strong>Regression</strong>: each tree predicts Y, and the final value is the <strong>average</strong>. <strong>Classification</strong>: each tree predicts a class, and the final answer is the <strong>majority vote</strong>.</li>
</ol>

<h3>Where is the "randomness"?</h3>
<p>So that the trees don't all learn the same thing, RF uses two tricks:</p>
<div class="two">
<div class="card"><h5>1. Bootstrap sampling (bagging)</h5><p>Each tree trains on a different random sample of <strong>rows</strong>.</p></div>
<div class="card"><h5>2. Random feature subsets</h5><p>At each split, only a random subset of <strong>features</strong> is considered.</p></div>
</div>
<div class="callout ex"><span class="ttl">Voting example</span>Five trees predict: Yes, No, Yes, Yes, No. Majority = <strong>Yes</strong> (3–2).</div>

<div class="vs">
<div><h5>Pros</h5><ul><li>Much less overfitting than a single tree (averaging reduces variance)</li><li>High accuracy, robust to noise and outliers</li><li>Gives <strong>feature importance</strong> (used for embedded selection)</li><li>No scaling needed</li></ul></div>
<div><h5>Cons</h5><ul><li>Slower to train and predict (many trees)</li><li>Less interpretable than one tree ("black box")</li><li>Larger memory footprint</li></ul></div>
</div>
`
        },
        {
            id: 'svm', title: 'Support Vector Machine (SVM)',
            html: String.raw`
<p class="lead">SVM can do classification or regression but is mostly used for <strong>classification</strong>. Each sample is a point in n-dimensional space (n = number of features). SVM finds the <strong>hyperplane</strong> that best separates the classes. In 2-D that's simply a line, the <strong>decision boundary</strong>.</p>

<svg viewBox="0 0 420 220" class="vis-svg" role="img" aria-label="SVM maximum margin diagram" style="width:100%;max-width:520px;display:block;margin:10px auto">
<line x1="60" y1="210" x2="300" y2="10" stroke="currentColor" stroke-width="2.5" style="color:var(--c)"/>
<line x1="20" y1="180" x2="250" y2="-10" stroke="currentColor" stroke-dasharray="6 5" opacity=".55"/>
<line x1="110" y1="230" x2="350" y2="30" stroke="currentColor" stroke-dasharray="6 5" opacity=".55"/>
<g fill="#2563eb"><circle cx="60" cy="60" r="7"/><circle cx="95" cy="40" r="7"/><circle cx="40" cy="110" r="7"/><circle cx="120" cy="80" r="9" stroke="#fbbf24" stroke-width="3"/><circle cx="70" cy="140" r="9" stroke="#fbbf24" stroke-width="3"/></g>
<g fill="#dc2626"><rect x="290" y="150" width="13" height="13"/><rect x="330" y="120" width="13" height="13"/><rect x="350" y="175" width="13" height="13"/><rect x="215" y="155" width="15" height="15" stroke="#fbbf24" stroke-width="3"/><rect x="270" y="105" width="15" height="15" stroke="#fbbf24" stroke-width="3"/></g>
<text x="300" y="30" font-size="12" fill="currentColor">hyperplane</text><text x="10" y="200" font-size="12" fill="currentColor">margin</text>
<text x="150" y="210" font-size="11" fill="currentColor" opacity=".7">ringed points = support vectors</text>
</svg>

<h3>Which hyperplane is best? Maximum margin</h3>
<p>The <strong>margin</strong> is the distance from the hyperplane to the nearest point of each class. SVM picks the hyperplane that <strong>maximises the margin</strong>. The nearest points that define it are the <strong>support vectors</strong>, and only they determine the boundary.</p>

<div class="tbl-wrap"><table class="tbl">
<tr><th>Scenario</th><th>Rule</th></tr>
<tr><td>1. Three hyperplanes A, B, C, one separates well</td><td>Select the hyperplane that <strong>segregates the two classes better</strong> (B)</td></tr>
<tr><td>2. All three separate well</td><td>Pick the one with the <strong>highest margin</strong> (C). It's more robust, and a low margin means a high chance of misclassification</td></tr>
<tr><td>3. B has the higher margin but misclassifies a point; A classifies all correctly</td><td>SVM chooses <strong>accurate classification first</strong>, then maximises margin, so <strong>A</strong></td></tr>
<tr><td>4. One star lies inside the circle region (outlier)</td><td>SVM <strong>ignores outliers</strong> and still finds the max-margin hyperplane (soft margin)</td></tr>
<tr><td>5. Classes not linearly separable (e.g. a ring)</td><td>Use the <strong>kernel trick</strong>: add a feature like z = x² + y², where a plane separates them</td></tr>
</table></div>

<h3>Soft margin: the C parameter</h3>
<div class="vs">
<div><h5>Large C</h5><p>Heavily penalises misclassification, giving a <strong>narrow margin</strong> that fits training data tightly. Risk: <strong>overfitting</strong>.</p></div>
<div><h5>Small C</h5><p>Tolerates some misclassified or inside-margin points, giving a <strong>wider margin</strong> that is smoother. Risk: underfitting.</p></div>
</div>

<h3>Kernels</h3>
<p>A kernel takes data as input and transforms it into the required form. Kernels return the <strong>inner product</strong> between two points in a (higher-dimensional) feature space without computing that space explicitly. Types: <strong>linear, polynomial, RBF (radial basis function), sigmoid</strong>. <strong>RBF is the most used</strong> because of its localised and finite response along the entire x-axis.</p>

<div class="vs">
<div><h5>Pros</h5><ul><li>Works well with a <strong>clear margin</strong> of separation</li><li>Effective in <strong>high-dimensional</strong> spaces</li><li>Memory efficient: uses only the support vectors</li></ul></div>
<div><h5>Cons</h5><ul><li>Poor on <strong>large datasets</strong> (long training time)</li><li>Poor with <strong>noisy</strong>, overlapping classes</li><li>Needs <strong>feature scaling</strong> (distance-based)</li></ul></div>
</div>
`
        },
        {
            id: 'bayes', title: 'Naïve Bayes',
            html: String.raw`
<p class="lead">A probabilistic classifier based on <strong>Bayes' theorem</strong> (Rev. Thomas Bayes). Used for spam filtering, document classification and sentiment prediction.</p>
$$P(c\mid x)=\frac{P(x\mid c)\,P(c)}{P(x)}$$
<div class="cards">
<div class="card"><span class="tag">P(c|x)</span><p><strong>Posterior</strong>: probability of the class given the predictors</p></div>
<div class="card"><span class="tag">P(c)</span><p><strong>Prior</strong>: probability of the class</p></div>
<div class="card"><span class="tag">P(x|c)</span><p><strong>Likelihood</strong>: probability of the predictor given the class</p></div>
<div class="card"><span class="tag">P(x)</span><p><strong>Evidence</strong>: prior probability of the predictor (the same for all classes, so it can be ignored when comparing)</p></div>
</div>

<h3>Why "naïve"?</h3>
<p>It assumes that the effect of each predictor on the class is <strong>independent of the other predictors</strong>, called <strong>class-conditional independence</strong>. Changing one feature doesn't influence the others. That's rarely true in reality, but it works well in practice. Under it:</p>
$$P(c\mid X)\ \propto\ P(c)\prod_{i} P(x_i\mid c)$$

<h3>The zero-frequency problem</h3>
<p>If a feature value never appears with a class in training, P(xᵢ|c) = 0 and the <strong>whole product becomes 0</strong>, however strong the other evidence is. The fix is <strong>Laplace smoothing</strong>: add 1 to every count, $(\text{count}+1)/(n_c + k)$, where k is the number of possible values.</p>

<div class="callout ex"><span class="ttl">Worked example: customer buying behaviour (10 customers)</span>
<p>New instance X = (Weather Sunny, Temp Cool, Humidity High, Wind Weak, Day Weekend, Promotion Yes).</p>
<p><strong>Step 1, priors</strong>: P(Yes) = 6/10, P(No) = 4/10.</p>
<p><strong>Step 2, likelihoods</strong>:</p>
<div class="tbl-wrap"><table class="tbl"><tr><th>Feature = value</th><th class="num">P(x|Yes)</th><th class="num">P(x|No)</th></tr>
<tr><td>Weather = Sunny</td><td class="num">1/6</td><td class="num">3/4</td></tr>
<tr><td>Temperature = Cool</td><td class="num">3/6</td><td class="num">1/4</td></tr>
<tr><td>Humidity = High</td><td class="num">2/6</td><td class="num">3/4</td></tr>
<tr><td>Wind = Weak</td><td class="num">3/6</td><td class="num">2/4</td></tr>
<tr><td>Day = Weekend</td><td class="num">3/6</td><td class="num">2/4</td></tr>
<tr><td>Promotion = Yes</td><td class="num">4/6</td><td class="num">2/4</td></tr></table></div>
<p><strong>Step 3, posteriors</strong> (unnormalised):</p>
$$P(\text{Yes}\mid X)\propto \tfrac16\cdot\tfrac36\cdot\tfrac26\cdot\tfrac36\cdot\tfrac36\cdot\tfrac46\cdot\tfrac{6}{10}=0.00278$$
$$P(\text{No}\mid X)\propto \tfrac34\cdot\tfrac14\cdot\tfrac34\cdot\tfrac24\cdot\tfrac24\cdot\tfrac24\cdot\tfrac{4}{10}=0.00703$$
<p>0.00703 &gt; 0.00278, so <strong>Buy = No</strong>.</p>
<p class="small">Note: the slide prints P(Yes|X) = 0.00139 (with 3/4 in the Yes product). Using the table's own value of 4/6 gives 0.00278. The final classification is <strong>No</strong> either way. Normalised: P(No|X) = 0.00703/(0.00703+0.00278) ≈ 72%.</p></div>

<div class="vs">
<div><h5>Pros</h5><ul><li>Fast and simple, good for real-time prediction</li><li>Works well with high dimensions and text (spam)</li><li>Needs relatively little training data</li><li>Handles multi-class problems</li></ul></div>
<div><h5>Cons</h5><ul><li>The independence assumption rarely holds</li><li>Zero-frequency problem (needs smoothing)</li><li>Probability estimates can be poorly calibrated</li></ul></div>
</div>
`
        },
        {
            id: 'knn', title: 'K-Nearest Neighbours (KNN)',
            html: String.raw`
<p class="lead">KNN predicts from the <strong>most similar examples</strong>. It is <strong>non-parametric</strong> and <strong>lazy</strong>.</p>
<div class="vs">
<div><h5>Non-parametric</h5><p>Makes <strong>no assumption</strong> about the underlying data distribution. The model structure comes from the data itself, which helps because real data rarely follows theoretical assumptions.</p></div>
<div><h5>Lazy learner</h5><p><strong>No model is built</strong> during training. All training data is used at test time, so <strong>training is fast</strong> but <strong>testing is slow and costly</strong> (time and memory). It must scan every point.</p></div>
</div>

<h3>How it works</h3>
<ol class="steps">
<li>Pick <strong>k</strong>, the number of neighbours (e.g. k = 3). With 2 classes, use an <strong>odd</strong> k to avoid ties. k = 1 is the "nearest neighbour" algorithm.</li>
<li><strong>Calculate the distance</strong> from the new point to every training point (Euclidean, Manhattan…).</li>
<li><strong>Find the k closest</strong> neighbours (sort the distances).</li>
<li><strong>Vote</strong>: the most common class among the k (e.g. 2 Yes, 1 No gives Yes).</li>
<li>Assign the predicted class. For regression, use the <em>average</em> of the k values.</li>
</ol>
$$d(p,q)=\sqrt{\sum_{i=1}^{n}(p_i-q_i)^2}$$

<div class="vis" data-vis="knn"></div>

<div class="callout trap"><span class="ttl">Crucial: feature scaling</span>KNN is distance-based, so unscaled features with big ranges (income) drown out small-range features (age). <strong>Always scale before KNN.</strong></div>
<div class="callout tip"><span class="ttl">Choosing k</span>Small k (1) is sensitive to noise and overfits. Large k is smoother but may underfit and blur class boundaries. Tune k on validation data.</div>

<div class="vs">
<div><h5>Pros</h5><ul><li>Simple, intuitive, with no training phase</li><li>No distribution assumptions</li><li>Naturally handles multi-class problems</li><li>Adapts as new data is added</li></ul></div>
<div><h5>Cons</h5><ul><li>Slow, memory-hungry prediction on large data</li><li>Needs scaling and is sensitive to irrelevant features</li><li>Suffers from the curse of dimensionality</li><li>Choosing k is non-trivial</li></ul></div>
</div>
`
        },
        {
            id: 'ann', title: 'Artificial Neural Networks',
            html: String.raw`
<p class="lead">An ANN models the relationship between input signals and an output signal, loosely inspired by how a <strong>biological brain</strong> responds to stimuli. It's a network of interconnected artificial <strong>neurons (nodes)</strong> working as a massive parallel processor. It is loosely inspired by the brain, not an accurate simulation of it.</p>

<h3>The artificial neuron (perceptron)</h3>
$$z=\sum_i w_ix_i + b,\qquad a=f(z)$$
<p>The inputs are multiplied by weights, summed with a bias, and passed through an <strong>activation function</strong> f.</p>

<h4>Perceptron learning rule</h4>
<ol class="steps"><li>Start with weights = 0 (or small random values).</li><li>For each training instance, classify with the current weights.</li><li>If correct (y = y*): <strong>no change</strong>.</li><li>If wrong: <strong>adjust</strong> the weight vector towards the correct answer: $w \leftarrow w + \eta\,(y^*-y)\,x$.</li></ol>

<h3>Activation functions</h3>
<p>The mechanism by which the neuron processes incoming information and passes it through the network, modelled on nature's design. <strong>Why needed?</strong> Without a non-linear activation, stacked layers collapse into a single linear function and can't learn non-linear patterns such as XOR.</p>
<div class="cards"><div class="card"><span class="tag">Step / threshold</span><p>Outputs 0 or 1. Classic perceptron.</p></div><div class="card"><span class="tag">Sigmoid</span><p>Range (0,1). Probabilities.</p></div><div class="card"><span class="tag">tanh</span><p>Range (−1,1). Zero-centred.</p></div><div class="card"><span class="tag">ReLU</span><p>max(0, z). Default for hidden layers.</p></div></div>

<h3>Architecture</h3>
<p>Input layer → one or more <strong>hidden layers</strong> → output layer. A network with <strong>multiple hidden layers</strong> is a <strong>Deep Neural Network (DNN)</strong>, and training it is <strong>deep learning</strong>.</p>

<h3>Backpropagation</h3>
<p>Starting weights are set at <strong>random</strong> (the network has no a priori knowledge). The algorithm iterates through cycles, each called an <strong>epoch</strong>, until a stopping criterion is reached. Each epoch has two phases:</p>
<div class="two">
<div class="card"><h5>1. Forward phase</h5><p>Neurons are activated in sequence from input to output, applying weights and activations, to produce an output signal.</p></div>
<div class="card"><h5>2. Backward phase</h5><p>The output is compared with the true target. The <strong>error is propagated backwards</strong> and weights are adjusted (gradient descent) to reduce future error.</p></div>
</div>

<h3>Why outputs can be poor</h3>
<ul><li><strong>Noise</strong>: if the data isn't separable, weights may thrash. Averaging weights over time (averaged perceptron) helps.</li><li><strong>Mediocre generalisation</strong>: it finds a "barely" separating solution.</li><li><strong>Overtraining</strong>: test accuracy rises, then falls. This is a kind of overfitting, so use early stopping.</li></ul>

<h3>Why hidden layers? XOR</h3>
<p>A single perceptron draws one straight line, which is enough for AND and OR but <strong>not XOR</strong> (not linearly separable). One hidden layer fixes it. With step activation (output 1 if z ≥ 0):</p>
<div class="tbl-wrap"><table class="tbl">
<tr><th>x₁</th><th>x₂</th><th>h₁ = step(x₁+x₂−0.5) <small>(OR)</small></th><th>h₂ = step(x₁+x₂−1.5) <small>(AND)</small></th><th>y = step(h₁−h₂−0.5)</th></tr>
<tr><td>0</td><td>0</td><td>0</td><td>0</td><td class="hl">0</td></tr>
<tr><td>0</td><td>1</td><td>1</td><td>0</td><td class="hl">1</td></tr>
<tr><td>1</td><td>0</td><td>1</td><td>0</td><td class="hl">1</td></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td class="hl">0</td></tr></table></div>
<p>XOR = OR AND NOT AND. The hidden layer builds the intermediate features that make the problem separable.</p>
<div class="vis" data-vis="neuron"></div>

<div class="vs">
<div><h5>Pros</h5><ul><li>Models complex, non-linear relationships</li><li>Few assumptions about the data</li><li>Works for classification and regression, including images, text and audio</li></ul></div>
<div><h5>Cons</h5><ul><li>Computationally intensive and slow to train</li><li>Needs lots of data. Prone to overfitting</li><li>Black box: hard to interpret</li></ul></div>
</div>
`
        },
        {
            id: 'compare', title: 'Comparing the algorithms',
            html: String.raw`
<div class="tbl-wrap"><table class="tbl">
<tr><th>Algorithm</th><th>Type</th><th>Key idea</th><th>Needs scaling?</th><th>Interpretable?</th><th>Main weakness</th></tr>
<tr><td>Linear regression</td><td>Regression</td><td>Best-fit line, least squares</td><td>Helps</td><td>High</td><td>Only linear relationships</td></tr>
<tr><td>Logistic regression</td><td>Classification</td><td>Sigmoid probability</td><td>Yes</td><td>High</td><td>Linear decision boundary</td></tr>
<tr><td>Decision tree</td><td>Both</td><td>IF–THEN splits (Gini)</td><td>No</td><td>Very high</td><td>Overfits, unstable</td></tr>
<tr><td>Random forest</td><td>Both</td><td>Many trees + vote/average</td><td>No</td><td>Medium</td><td>Slow, less interpretable</td></tr>
<tr><td>SVM</td><td>Mostly classification</td><td>Maximum-margin hyperplane, kernels</td><td>Yes</td><td>Low–medium</td><td>Slow on big or noisy data</td></tr>
<tr><td>Naïve Bayes</td><td>Classification</td><td>Bayes + independence</td><td>No</td><td>Medium</td><td>Independence assumption</td></tr>
<tr><td>KNN</td><td>Both</td><td>Majority of k nearest</td><td><strong>Yes</strong></td><td>Medium</td><td>Slow prediction, curse of dimensionality</td></tr>
<tr><td>ANN</td><td>Both</td><td>Layers of neurons, backprop</td><td>Yes</td><td>Low</td><td>Data-hungry, black box</td></tr>
</table></div>

<h3>Which algorithm should I use?</h3>
<ul>
<li>Need to <strong>explain decisions</strong> → decision tree or logistic regression.</li>
<li>Tabular data, want strong accuracy with little tuning → <strong>random forest</strong>.</li>
<li>Text / spam with many features → <strong>Naïve Bayes</strong> (fast baseline) or linear SVM.</li>
<li>Small dataset, clear margin, high dimensions → <strong>SVM</strong>.</li>
<li>Small dataset, simple similarity logic → <strong>KNN</strong> (scale first!).</li>
<li>Images, audio, complex non-linear patterns, lots of data → <strong>neural networks</strong>.</li>
</ul>

<h3>Practical scikit-learn workflow</h3>
<pre><code>from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, confusion_matrix

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler().fit(X_train)                 # fit on TRAIN only
model  = KNeighborsClassifier(n_neighbors=5).fit(scaler.transform(X_train), y_train)
y_pred = model.predict(scaler.transform(X_test))
print(accuracy_score(y_test, y_pred)); print(confusion_matrix(y_test, y_pred))</code></pre>
<p>Every sklearn model follows the same pattern: <code>fit(X, y)</code> → <code>predict(X_new)</code> → evaluate.</p>
`
        }
    ],
    notes: String.raw`
<h3>1. Supervised learning</h3>
<p>Learns a mapping x → y from labelled samples, then predicts y for unseen x. <strong>Classification</strong> gives discrete, unordered classes. <strong>Regression</strong> gives continuous values.</p>

<h3>2. Regression</h3>
<p><strong>Linear</strong>: Y = mX + c, with m and c chosen by least squares (minimise Σ residual²). Residual = actual − predicted. <strong>Multiple</strong>: several inputs (CO₂ from volume and weight). <strong>Polynomial</strong>: powers of x for curves, where a high degree overfits. <strong>Logistic</strong>: binary classification. σ(z) = 1/(1+e^{−z}) maps to (0,1), with threshold 0.5.</p>

<h3>3. Decision tree</h3>
<p>Root, decision (branch) and leaf nodes. Leaves assign classes by majority, and root-to-leaf paths are rules. CART chooses the variable and split value. Gini impurity = 1 − Σp² (lower is purer). The lecture's Gini score is Σp² (higher is purer). Piano example: Gender score 0.59 (impurity 0.41) vs ≈0.51 for the others, so split on <strong>Gender</strong>. Pros: interpretable, no dummies, no scaling. Cons: overfitting, instability.</p>

<h3>4. Random forest</h3>
<p>An ensemble of trees. Bootstrap N records → build a tree → repeat. Classification uses a majority vote, and regression uses the average. Randomness comes from bootstrap rows and random feature subsets at each split. It reduces overfitting and gives feature importance, but is slower and less interpretable.</p>

<h3>5. SVM</h3>
<p>Finds the hyperplane that maximises the margin to the nearest points (the support vectors). Rules: classify correctly first, then maximise margin; ignore outliers (soft margin). C: large C gives a narrow margin and overfitting risk, while small C gives a wide margin. Kernel trick: linear, polynomial, <strong>RBF (most used)</strong>, sigmoid. Kernels give inner products in a higher-dimensional space. Pros: clear margins, high dimensions, memory efficient. Cons: large or noisy data, needs scaling.</p>

<h3>6. Naïve Bayes</h3>
<p>P(c|x) = P(x|c)P(c)/P(x). It is naïve because it assumes class-conditional independence. Zero-frequency means one zero likelihood wipes out the product, so use Laplace smoothing. Buying example: Yes ∝ 0.00278, No ∝ 0.00703, so <strong>No</strong>.</p>

<h3>7. KNN</h3>
<p>Non-parametric (no distribution assumption) and lazy (no training; slow, costly testing). Steps: choose k (odd for 2 classes), compute distances (Euclidean), take the k nearest, majority vote. Scaling is crucial.</p>

<h3>8. ANN</h3>
<p>A neuron computes z = Σwx + b, then a = f(z). Perceptron rule: no change if correct, adjust weights if wrong. Activations add non-linearity. Multiple hidden layers make a DNN (deep learning). Backpropagation: random initial weights, then epochs of a forward phase (compute output) and a backward phase (propagate error, update weights). Problems: noise (weights thrash), mediocre generalisation, and overtraining. XOR needs a hidden layer (OR and NOT AND).</p>
`,
    subjective: [
        { q: 'Differentiate classification and regression, giving TWO examples of each.', m: 4, a: String.raw`<p><strong>Classification</strong> predicts categorical class labels, which are discrete and unordered. Examples: spam vs not-spam email, and whether a tumour is malignant or benign.</p><p><strong>Regression</strong> predicts continuous numeric values. Examples: house price, and tomorrow's temperature or electricity demand.</p>` },
        { q: 'Using the Gini index, determine the best split for the "students playing piano" data: Gender (Female 10: 0.2 play/0.8 not; Male 20: 0.65/0.35), Plays other instrument (Yes 12: 0.42/0.58; No 18: 0.56/0.44), Class (8th 14: 0.43/0.57; 9th 16: 0.56/0.44).', m: 8, a: String.raw`<p>Using the Gini score Σp² (higher = purer):</p><ul><li>Gender: Female 0.2²+0.8² = 0.68; Male 0.65²+0.35² = 0.545. Weighted = (10/30)(0.68)+(20/30)(0.545) = <strong>0.59</strong>.</li><li>Other instrument: Yes 0.42²+0.58² ≈ 0.51; No 0.56²+0.44² ≈ 0.51. Weighted ≈ <strong>0.51</strong>.</li><li>Class: 8th ≈ 0.51; 9th ≈ 0.51. Weighted ≈ <strong>0.51</strong>.</li></ul><p>Gender has the highest Gini score, which equals the lowest Gini impurity (1 − 0.59 = 0.41 vs 0.49). Its sub-nodes are the most homogeneous, so the tree <strong>splits on Gender</strong>.</p>` },
        { q: 'Explain how a random forest makes predictions and where its randomness comes from. Why does it overfit less than a single decision tree?', m: 6, a: String.raw`<p><strong>Steps</strong>: (1) pick N random records with replacement (bootstrap); (2) build a decision tree on them; (3) repeat for the chosen number of trees; (4) for a new record, every tree predicts. Classification uses the <strong>majority vote</strong>, and regression uses the <strong>average</strong>.</p><p><strong>Randomness</strong>: (i) each tree sees a different bootstrap sample of rows; (ii) at each split, only a random subset of features is considered. The trees are therefore diverse and their errors less correlated.</p><p><strong>Less overfitting</strong>: a single deep tree has high variance and memorises noise. Averaging or voting over many decorrelated trees cancels individual errors, which reduces variance without much increase in bias.</p>` },
        { q: 'Explain the concepts of hyperplane, margin and support vectors in SVM. How does SVM handle data that is not linearly separable?', m: 6, a: String.raw`<p>The <strong>hyperplane</strong> is the decision boundary separating the classes (a line in 2-D, a plane in 3-D). The <strong>margin</strong> is the distance between the hyperplane and the nearest data points of each class. SVM chooses the hyperplane that <strong>maximises</strong> this margin for robustness. The <strong>support vectors</strong> are those nearest points, and only they define the hyperplane.</p><p><strong>Non-separable data</strong>: (1) a <em>soft margin</em> (parameter C) allows some points to be misclassified or inside the margin, ignoring outliers; (2) the <em>kernel trick</em> implicitly maps data to a higher-dimensional space where a linear separator exists (e.g. adding z = x²+y² for ring-shaped data), using kernels such as polynomial or RBF, which return inner products in that space.</p>` },
        { q: 'Using Naïve Bayes and the given counts, classify X = (Sunny, Cool, High, Weak, Weekend, Promotion=Yes). P(Yes)=6/10, P(No)=4/10. Likelihoods for Yes: 1/6, 3/6, 2/6, 3/6, 3/6, 4/6; for No: 3/4, 1/4, 3/4, 2/4, 2/4, 2/4.', m: 8, a: String.raw`<p><strong>Step 1, priors</strong>: P(Yes) = 0.6, P(No) = 0.4.</p><p><strong>Step 2, likelihoods</strong>: as given in the question.</p><p><strong>Step 3, posteriors</strong> (ignoring P(X), which is common to both):</p><p>P(Yes|X) ∝ (1/6)(3/6)(2/6)(3/6)(3/6)(4/6)(0.6) = 216/46656 × 0.6 ≈ <strong>0.00278</strong>.</p><p>P(No|X) ∝ (3/4)(1/4)(3/4)(2/4)(2/4)(2/4)(0.4) ≈ <strong>0.00703</strong>.</p><p>Since 0.00703 &gt; 0.00278, classify <strong>Buy = No</strong>. (Normalised, P(No|X) ≈ 0.72.)</p>` },
        { q: 'Why is Naïve Bayes called "naïve"? What is the zero-frequency problem and how is it solved?', m: 4, a: String.raw`<p>It is naïve because it assumes <strong>class-conditional independence</strong>: each predictor's effect on the class is independent of the other predictors, which is rarely true in practice.</p><p><strong>Zero-frequency problem</strong>: if a feature value never occurs with a class in training, its likelihood is 0, so the whole product of likelihoods (the posterior) becomes 0 regardless of the other evidence. <strong>Solution</strong>: Laplace (add-one) smoothing, which adds 1 to every count so that no probability is exactly zero.</p>` },
        { q: 'Describe the KNN algorithm. Why is it called a lazy, non-parametric learner, and why must features be scaled?', m: 6, a: String.raw`<p><strong>Algorithm</strong>: choose k; compute the distance (e.g. Euclidean $\sqrt{\sum(p_i-q_i)^2}$) from the new point to all training points; select the k nearest; assign the majority class (or the average for regression).</p><p><strong>Lazy</strong>: it builds no model during training. All training data is kept and used at prediction time, so training is fast and testing is slow and memory-costly. <strong>Non-parametric</strong>: it makes no assumption about the data distribution, and the structure comes from the data.</p><p><strong>Scaling</strong>: because KNN relies on distances, features with large ranges (e.g. income) dominate small-range features (e.g. age). Standardising puts all features on an equal footing.</p>` },
        { q: 'Explain the backpropagation algorithm, including the terms epoch, forward phase and backward phase.', m: 6, a: String.raw`<p>Backpropagation trains a neural network. Because the network has no a priori knowledge, the <strong>weights are initialised randomly</strong>. The algorithm then iterates through many cycles. Each full cycle over the training data is an <strong>epoch</strong>, and it continues until a stopping criterion is met (e.g. a target error or a maximum number of epochs).</p><p>Each epoch has: (1) a <strong>forward phase</strong>, where neurons are activated in sequence from the input layer to the output layer, applying each neuron's weights and activation function to produce an output; and (2) a <strong>backward phase</strong>, where the output is compared with the true target, the error is propagated backwards through the network, and the weights are adjusted (gradient descent) to reduce future error.</p>` },
        { q: 'Why can a single-layer perceptron not solve XOR? Show how a network with one hidden layer solves it.', m: 6, a: String.raw`<p>XOR outputs 1 for (0,1) and (1,0) and 0 for (0,0) and (1,1). These points are <strong>not linearly separable</strong>: no single straight line separates the 1s from the 0s, and a single perceptron can only draw one linear boundary.</p><p>With a hidden layer (step activation): h₁ = step(x₁ + x₂ − 0.5) computes OR, h₂ = step(x₁ + x₂ − 1.5) computes AND, and y = step(h₁ − h₂ − 0.5) outputs 1 only when OR is true and AND is false. Checking: (0,0) → 0, (0,1) → 1, (1,0) → 1, (1,1) → 0. The hidden layer creates new features in which the problem becomes linearly separable.</p>` }
    ],
    mcq: [
        { q: 'Supervised learning is so called because:', o: ['A human watches the training', 'The desired output labels are known during training', 'It needs a GPU', 'It uses rewards'], a: 1, e: 'The model learns from samples paired with known responses.' },
        { q: 'Predicting whether a tumour is malignant or benign is:', o: ['Regression', 'Classification', 'Clustering', 'Reinforcement learning'], a: 1, e: 'Discrete classes.' },
        { q: 'In Y = mX + c, m represents:', o: ['The intercept', 'The slope', 'The residual', 'The error'], a: 1, e: 'c is the intercept.' },
        { q: 'Ordinary least squares chooses the line that minimises:', o: ['The sum of residuals', 'The sum of squared residuals', 'The largest residual', 'The number of points'], a: 1, e: 'Squaring makes errors positive and penalises big errors.' },
        { q: 'Model ŷ = 5x + 40. A student studies 6 hours and scores 74. The residual is:', o: ['−4', '+4', '70', '34'], a: 1, e: 'ŷ = 70, and the residual = actual − predicted = 74 − 70 = 4.' },
        { q: 'Predicting CO₂ from both engine volume and car weight is:', o: ['Polynomial regression', 'Multiple regression', 'Logistic regression', 'Simple linear regression'], a: 1, e: 'More than one independent variable.' },
        { q: 'A very high-degree polynomial regression fitted to noisy data typically:', o: ['Underfits', 'Overfits', 'Becomes logistic', 'Has zero variance'], a: 1, e: 'It follows the noise and generalises poorly.' },
        { q: 'Logistic regression is used for:', o: ['Predicting continuous values', 'Binary classification by estimating probability', 'Clustering', 'Dimensionality reduction'], a: 1, e: 'Despite its name, it is a classifier.' },
        { q: 'The sigmoid function σ(0) equals:', o: ['0', '0.5', '1', 'e'], a: 1, e: '1/(1+e⁰) = 1/2.' },
        { q: 'In a decision tree, class labels are found at:', o: ['The root node', 'Branch nodes', 'Leaf nodes', 'Edges'], a: 2, e: 'Leaves assign classes by majority vote.' },
        { q: 'Using Gini IMPURITY (1 − Σp²), the best split is the one with:', o: ['The highest impurity', 'The lowest weighted impurity', 'The most branches', 'The most samples'], a: 1, e: 'Lower impurity means more homogeneous sub-nodes.' },
        { q: 'A node with 50% Yes and 50% No has Gini impurity:', o: ['0', '0.25', '0.5', '1'], a: 2, e: '1 − (0.25 + 0.25) = 0.5, the maximum for two classes.' },
        { q: 'An advantage of decision trees mentioned in the lecture is:', o: ['They never overfit', 'No need to create dummy variables', 'They require feature scaling', 'They are always the most accurate'], a: 1, e: 'Trees can split directly on categories.' },
        { q: 'A random forest classifier makes its final prediction by:', o: ['Averaging the tree depths', 'A majority vote of the trees', 'Choosing the first tree', 'Multiplying probabilities'], a: 1, e: 'Regression uses the average of the trees\' predictions.' },
        { q: 'Which is NOT a source of randomness in random forest?', o: ['Bootstrap samples of rows', 'Random subset of features at each split', 'Random class labels', 'Both A and B are sources'], a: 2, e: 'Labels are never randomised.' },
        { q: 'In SVM, the support vectors are:', o: ['All training points', 'The points nearest to the hyperplane that define the margin', 'Outliers removed from data', 'The kernel parameters'], a: 1, e: 'Only these points determine the boundary.' },
        { q: 'If hyperplane B has a larger margin but misclassifies a point, while A classifies all correctly, SVM chooses:', o: ['B', 'A', 'Neither', 'Both'], a: 1, e: 'SVM prioritises correct classification before maximising the margin.' },
        { q: 'A large value of the SVM parameter C leads to:', o: ['A wider margin, more tolerance of errors', 'A narrower margin, fewer training errors, overfitting risk', 'No margin', 'A linear kernel only'], a: 1, e: 'A large C penalises misclassification heavily.' },
        { q: 'The most commonly used SVM kernel is:', o: ['Linear', 'Polynomial', 'RBF (radial basis function)', 'Sigmoid'], a: 2, e: 'Chosen for its localised, finite response.' },
        { q: 'An SVM disadvantage is:', o: ['It fails in high dimensions', 'It is slow on large datasets and poor with noisy, overlapping classes', 'It uses all training points in its decision', 'It cannot classify'], a: 1, e: 'It is effective in high dimensions and memory efficient.' },
        { q: 'Naïve Bayes is "naïve" because it assumes:', o: ['All classes are equally likely', 'Features are independent given the class', 'Data is normally distributed', 'There are only two classes'], a: 1, e: 'Class-conditional independence.' },
        { q: 'In Bayes\' theorem, P(c) is the:', o: ['Posterior', 'Likelihood', 'Prior', 'Evidence'], a: 2, e: 'P(c|x) is the posterior, P(x|c) the likelihood, and P(x) the evidence.' },
        { q: 'The zero-frequency problem in Naïve Bayes is solved by:', o: ['Removing the feature', 'Laplace (add-one) smoothing', 'Feature scaling', 'Using more classes'], a: 1, e: 'Adding one to every count avoids zero probabilities.' },
        { q: 'KNN is called a lazy learner because:', o: ['It is slow to train', 'It builds no model during training and does the work at prediction time', 'It uses few features', 'It ignores distance'], a: 1, e: 'Training is fast, and testing is slow and costly.' },
        { q: 'For a 2-class KNN problem, k is usually chosen to be:', o: ['Even', 'Odd, to avoid ties', 'Always 1', 'Equal to the number of features'], a: 1, e: 'An odd k prevents tied votes.' },
        { q: 'Euclidean distance between (1, 2) and (4, 6) is:', o: ['3', '4', '5', '7'], a: 2, e: '√(3² + 4²) = 5.' },
        { q: 'KNN neighbours vote: Yes, Yes, No (k = 3). Prediction:', o: ['No', 'Yes', 'Tie', 'Cannot tell'], a: 1, e: 'Majority vote 2–1.' },
        { q: 'A neural network with multiple hidden layers is called:', o: ['A perceptron', 'A deep neural network', 'A random forest', 'A support vector machine'], a: 1, e: 'Training DNNs is called deep learning.' },
        { q: 'In the perceptron learning rule, if a training instance is classified correctly:', o: ['The weights are reset', 'The weights do not change', 'The learning rate doubles', 'The bias is removed'], a: 1, e: 'Weights are adjusted only when the prediction is wrong.' },
        { q: 'Each full cycle of forward and backward phases over the training data in backpropagation is called:', o: ['A batch', 'An epoch', 'A kernel', 'A layer'], a: 1, e: 'Training repeats epochs until a stopping criterion is met.' },
        { q: 'Why can a single perceptron not learn XOR?', o: ['XOR has too many inputs', 'XOR is not linearly separable', 'XOR needs regression', 'Perceptrons cannot use binary inputs'], a: 1, e: 'One linear boundary cannot separate XOR\'s classes. A hidden layer is needed.' },
        { q: 'Without non-linear activation functions, a deep network:', o: ['Becomes more powerful', 'Collapses into a single linear transformation', 'Cannot be trained', 'Becomes a decision tree'], a: 1, e: 'A composition of linear functions is linear.' },
        { q: '"Overtraining" in neural networks means:', o: ['Test accuracy keeps rising forever', 'Test/held-out accuracy rises, then falls, a kind of overfitting', 'The network has too few weights', 'Training data is too small'], a: 1, e: 'Use early stopping and validation monitoring.' }
    ]
});

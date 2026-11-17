ML.addChapter({
    id: 1,
    title: 'Introduction to Machine Learning',
    short: 'Intro to ML',
    lecture: 'Lecture 1',
    color: '#0284c7',
    blurb: 'Definitions, T-E-P, types of learning, the main challenges and the KDD / CRISP-DM / SEMMA frameworks.',
    outcomes: [
        'Describe and explain what machine learning is',
        'Identify what machine learning can do and the types of learning',
        'Evaluate the types of machine learning frameworks (KDD, CRISP-DM, SEMMA)'
    ],
    topics: [
        {
            id: 'what', title: 'What machine learning is',
            html: String.raw`
<p class="lead">Machine learning (ML) is the science (and art) of programming computers so they can <strong>learn from data</strong> instead of following rules a human wrote out one by one.</p>

<h3>Two definitions you must be able to quote</h3>
<div class="two">
  <div class="card"><span class="tag">General · Arthur Samuel, 1959</span><p>"The field of study that gives computers the ability to learn <strong>without being explicitly programmed</strong>."</p></div>
  <div class="card"><span class="tag">Engineering · Tom Mitchell, 1997</span><p>"A computer program is said to learn from <strong>experience E</strong> with respect to some <strong>task T</strong> and some <strong>performance measure P</strong>, if its performance on T, as measured by P, improves with experience E."</p></div>
</div>

<h3>Traditional programming vs machine learning</h3>
<div class="vs">
  <div><h5>Traditional programming</h5><p><strong>Rules + Data → Output</strong></p><p class="small">The programmer writes the rule explicitly, e.g. <code>IF temperature &gt; 30 THEN turn fan ON</code>.</p></div>
  <div><h5>Machine learning</h5><p><strong>Data + desired outcome → Learned model</strong></p><p class="small">The algorithm discovers the relationship from examples. The "rule" is the trained model.</p></div>
</div>

<h3>The T-E-P formulation</h3>
<p>A system learns when <strong>performance P</strong> on <strong>task T</strong> improves through <strong>experience E</strong>.</p>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Letter</th><th>Meaning</th><th>House-price example</th></tr>
<tr><td><strong>T</strong> – Task</td><td>The real-world problem, stated as concretely as possible as an ML task (classification, regression…)</td><td>Predict house price</td></tr>
<tr><td><strong>E</strong> – Experience</td><td>Consuming data samples so the algorithm learns patterns. Can be historical data in one go or fresh data as it arrives</td><td>Historical house sales data</td></tr>
<tr><td><strong>P</strong> – Performance</td><td>A quantitative metric of how well T is done. Measured on training data <em>and</em> on unseen validation/test data</td><td>Prediction accuracy / error</td></tr>
</table></div>

<div class="callout key"><span class="ttl">Key idea</span>As the model learns from more appropriate data (E), its performance (P) on the task (T) should improve. If P doesn't improve with E, the system isn't learning.</div>

<details class="check"><summary>Check yourself: a spam filter improves as users flag more emails. Identify T, E and P.</summary>
<div><p><strong>T</strong>: classify emails as spam / not spam. <strong>E</strong>: the emails users have flagged (labelled examples). <strong>P</strong>: the proportion of emails correctly classified (accuracy) on new emails.</p></div></details>

<details class="check"><summary>Check yourself: why is "IF temperature &gt; 30 THEN fan ON" not machine learning?</summary>
<div><p>The rule was written by a human. Nothing is learned from data, and the program will not improve with more experience.</p></div></details>
`
        },
        {
            id: 'tasks', title: 'ML tasks & when to use ML',
            html: String.raw`
<p class="lead">A task T is defined by what the system should do with each data sample. A sample is made of several <strong>attributes</strong>, which ML calls <strong>features</strong>.</p>

<h3>The common task types</h3>
<div class="cards">
  <div class="card"><span class="tag">Classification</span><p>Assign each sample to a <strong>class / category</strong>. E.g. fraud vs legit, apple vs orange.</p></div>
  <div class="card"><span class="tag">Regression</span><p>Predict a <strong>real numerical value</strong>. E.g. house price, stock change.</p></div>
  <div class="card"><span class="tag">Anomaly detection</span><p>Scan event/transaction logs to find <strong>unusual patterns</strong> that differ from normal behaviour.</p></div>
  <div class="card"><span class="tag">Translation</span><p>Map input in one language to output in another desired language.</p></div>
  <div class="card"><span class="tag">Clustering</span><p>Form groups by learning <strong>latent patterns and similarities</strong> among the samples themselves.</p></div>
</div>

<h3>When is machine learning a good idea?</h3>
<ol class="steps">
  <li><strong>Hand-tuned / long rule lists.</strong> One ML algorithm can often simplify the code and perform better.</li>
  <li><strong>Complex problems with no good traditional solution.</strong> The best ML techniques can find one.</li>
  <li><strong>Fluctuating environments.</strong> An ML system can adapt to new data.</li>
  <li><strong>Insight into complex problems and large data.</strong> This is data mining: ML reveals patterns humans miss.</li>
</ol>

<div class="callout tip"><span class="ttl">Exam tip</span>When asked "is this classification or regression?", look at the <strong>output</strong>. Output is a category gives classification. Output is a continuous number gives regression. The input type doesn't matter.</div>

<details class="check"><summary>Check yourself: predicting tomorrow's temperature in °C. Which task?</summary><div><p>Regression, because the output is a continuous number.</p></div></details>
<details class="check"><summary>Check yourself: grouping customers by search history with no labels. Which task?</summary><div><p>Clustering. There are no labels, and the groups come from similarity.</p></div></details>
`
        },
        {
            id: 'types', title: 'Types of learning systems',
            html: String.raw`
<p class="lead">ML methods can be classified under three separate "umbrellas". A single system has one answer under <em>each</em> umbrella.</p>

<div class="tbl-wrap"><table class="tbl">
<tr><th>Umbrella (based on…)</th><th>Categories</th></tr>
<tr><td>Amount of human supervision</td><td>Supervised · Unsupervised · Reinforcement</td></tr>
<tr><td>Ability to learn from incremental data</td><td>Batch (offline) · Online</td></tr>
<tr><td>Approach to generalization</td><td>Instance-based · Model-based</td></tr>
</table></div>

<h3>1. Supervision</h3>
<div class="cards">
  <div class="card"><span class="tag">Supervised</span><p>Uses <strong>labelled</strong> data. Works like trial and error: the model adjusts when it misclassifies labelled points, then is tested on unseen data. Two types: <strong>classification</strong> and <strong>regression</strong>.</p></div>
  <div class="card"><span class="tag">Unsupervised</span><p>Given <strong>unlabelled</strong> data, the model finds similarities and patterns by itself and bundles similar inputs together (e.g. <strong>clustering</strong> users by search history).</p></div>
  <div class="card"><span class="tag">Reinforcement</span><p>"Learning through experimentation." The agent is <strong>rewarded</strong> for correct decisions and <strong>punished</strong> for wrong ones, and learns to maximise reward. Mostly games and robotics. Analogy: teaching a dog to fetch with treats.</p></div>
</div>
<div class="callout note"><span class="ttl">Lecture wording</span>The Lecture 1 slides say RL is "also called semi-supervised" and "works off unlabelled data". In standard terminology, <em>semi-supervised</em> learning means mixing a little labelled data with a lot of unlabelled data, which is a different idea. If an exam question quotes the slide, give the slide's wording, but understand that RL learns from <strong>rewards</strong>, not labels.</div>

<h3>2. Batch vs online learning</h3>
<div class="vs">
  <div><h5>Batch (offline) learning</h5><ul><li>Cannot learn incrementally. It must train on <strong>all</strong> available data.</li><li>Takes a lot of time and compute, so it is done offline.</li><li>Trained, then launched. In production it <strong>only applies</strong> what it learned.</li></ul></div>
  <div><h5>Online learning</h5><ul><li>Trains <strong>incrementally</strong> on instances fed sequentially, individually or in <strong>mini-batches</strong>.</li><li>Each step is fast and cheap, so it learns on the fly.</li><li>Also used for huge datasets that don't fit in memory, called <strong>out-of-core learning</strong>.</li></ul></div>
</div>

<h3>3. Instance-based vs model-based</h3>
<div class="vs">
  <div><h5>Instance-based</h5><p><em>"Which previous examples look like this?"</em></p><p class="small">Learns the examples <strong>by heart</strong>, then generalises with a <strong>similarity measure</strong>. E.g. a spam filter that flags emails identical (or similar) to known spam. KNN is the classic example.</p></div>
  <div><h5>Model-based</h5><p><em>"What general relationship can I learn?"</em></p><p class="small">Builds a <strong>model</strong> of the examples (e.g. a line or trend) and uses it to predict. E.g. linear regression of life satisfaction vs GDP.</p></div>
</div>

<details class="check"><summary>Check yourself: a recommender retrains every night on all data, then serves predictions all day without changing. Batch or online?</summary><div><p>Batch (offline). It trains on all the data at once, and the deployed model doesn't learn while serving.</p></div></details>
<details class="check"><summary>Check yourself: is KNN instance-based or model-based?</summary><div><p>Instance-based. It stores the training examples and predicts by similarity (distance) to them. It never builds an explicit model.</p></div></details>
`
        },
        {
            id: 'challenges', title: 'Main challenges: data & fit',
            html: String.raw`
<p class="lead">Two things can go wrong: <strong>bad data</strong> or a <strong>bad algorithm/model</strong>. The slides list these challenges.</p>

<div class="cards">
  <div class="card"><span class="tag">Insufficient data</span><p>Even simple problems need thousands of examples. Image or speech recognition may need millions, unless you reuse parts of an existing model.</p></div>
  <div class="card"><span class="tag">Non-representative data</span><p>Training data must represent the new cases you'll generalise to. Adding a few missing countries completely changed the life-satisfaction model.</p></div>
  <div class="card"><span class="tag">Poor-quality data</span><p>Errors, outliers and noise hide patterns. Discard or fix outliers. Handle missing features (ignore attribute, ignore instances, fill with median, or train two models). <em>Garbage in, garbage out.</em></p></div>
  <div class="card"><span class="tag">Irrelevant features</span><p>Fix with <strong>feature engineering</strong>: feature <strong>selection</strong>, feature <strong>extraction</strong> (combine features, e.g. dimensionality reduction), and creating new features by gathering new data.</p></div>
</div>

<h3>Overfitting vs underfitting</h3>
<p>Analogy: a taxi driver rips you off abroad, so you decide <em>all</em> taxi drivers there are thieves. That's <strong>overgeneralising</strong>. Machines do the same.</p>
<div class="vs">
  <div><h5>Overfitting</h5><p>Model performs <strong>well on training data</strong> but <strong>does not generalise</strong>. Happens when the model is <strong>too complex</strong> relative to the amount and noisiness of the data.</p><p><strong>Fixes:</strong></p><ol><li>Simplify the model (fewer parameters, e.g. linear instead of high-degree polynomial), reduce attributes, or <strong>constrain</strong> it (regularisation).</li><li>Gather more training data.</li><li>Reduce noise (fix errors, remove outliers).</li></ol></div>
  <div><h5>Underfitting</h5><p>The opposite: the model is <strong>too simple</strong> to learn the underlying structure. Inaccurate <strong>even on training examples</strong>.</p><p><strong>Fixes:</strong></p><ol><li>Select a more powerful model with more parameters.</li><li>Feed better features (feature engineering).</li><li>Reduce constraints (e.g. lower the regularisation hyperparameter).</li></ol></div>
</div>

<div class="vis" data-vis="fit"></div>

<div class="callout trap"><span class="ttl">Exam trap</span>"More data" fixes <strong>overfitting</strong>, but it does little for <strong>underfitting</strong>. A straight line stays a bad fit to a curve however much data you add. Underfitting needs a more powerful model or better features.</div>

<details class="check"><summary>Check yourself: training accuracy 99%, test accuracy 62%. Diagnosis and two fixes?</summary><div><p>Overfitting. Fixes include simplifying or regularising the model, gathering more data, and removing noise and outliers.</p></div></details>
<details class="check"><summary>Check yourself: training accuracy 58%, test accuracy 56%. Diagnosis?</summary><div><p>Underfitting. It does badly even on the training data. Use a more powerful model, better features, or less regularisation.</p></div></details>
`
        },
        {
            id: 'frameworks', title: 'KDD, CRISP-DM & SEMMA',
            html: String.raw`
<p class="lead">Three data-mining process frameworks are widely used by experts to build ML systems.</p>

<h3>1. KDD – Knowledge Discovery in Databases</h3>
<div class="flow arrows"><span>Selection</span><span>Pre-processing</span><span>Transformation</span><span>Data Mining</span><span>Interpretation / Evaluation</span></div>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Step</th><th>What happens</th></tr>
<tr><td>Selection</td><td>Select and integrate target data from many heterogeneous sources. Retrieve the relevant subset of variables and samples.</td></tr>
<tr><td>Pre-processing</td><td>Real data is <strong>incomplete</strong> (missing values), <strong>noisy</strong> (errors, outliers) and <strong>inconsistent</strong> (discrepancies). Clean it, or mining gives unreliable output.</td></tr>
<tr><td>Transformation</td><td>Transform or consolidate data into forms suitable for mining, i.e. find useful features for the goal.</td></tr>
<tr><td>Data mining</td><td>Apply ML algorithms to extract patterns.</td></tr>
<tr><td>Interpretation / Evaluation</td><td>Make patterns understandable to the user through summarisation and visualisation.</td></tr>
</table></div>

<h3>2. CRISP-DM – CRoss Industry Standard Process for Data Mining</h3>
<div class="flow arrows"><span>Business Understanding</span><span>Data Understanding</span><span>Data Preparation</span><span>Modelling</span><span>Evaluation</span><span>Deployment</span></div>
<ul>
<li><strong>Business understanding</strong>: objectives from a business perspective, converted into an ML problem definition and plan. Defines how success will be measured.</li>
<li><strong>Data understanding</strong>: find data gaps, relevance, quality issues and first insights, and form hypotheses. Results go back to the business iteratively.</li>
<li><strong>Data preparation</strong>: clean (fill gaps, treat missing values), pick important features, transform, and create new features.</li>
<li><strong>Modelling / evaluation</strong>: apply several algorithms, tune parameters, record performance, and check it against business criteria.</li>
<li><strong>Deployment</strong>: implement the signed-off model and train its consumers to use the output for decisions.</li>
</ul>
<div class="callout key"><span class="ttl">Key idea</span>CRISP-DM is <strong>iterative</strong>. You loop back (e.g. Evaluation → Business Understanding) whenever the model doesn't meet the criteria.</div>

<h3>3. SEMMA – Sample, Explore, Modify, Model, Assess</h3>
<p>Built into <strong>SAS Enterprise Miner</strong> (SAS Institute).</p>
<div class="flow arrows"><span>Sample<small>right-volume subset</small></span><span>Explore<small>uni/multivariate + viz</small></span><span>Modify<small>clean, derive, transform</small></span><span>Model<small>apply techniques</small></span><span>Assess<small>evaluate on test data</small></span></div>
<ul>
<li><strong>Explore</strong>: <em>univariate</em> analysis looks at each variable's distribution. <em>Multivariate</em> analysis looks at relationships between variables. Heavy use of visualisation.</li>
<li><strong>Assess</strong>: evaluate on test data <em>not used in training</em>, for reliability and business usefulness.</li>
</ul>

<div class="callout tip"><span class="ttl">How to tell them apart</span>Only <strong>CRISP-DM</strong> starts with <em>business understanding</em> and ends with <em>deployment</em>. <strong>SEMMA</strong> starts with <em>sampling</em> and is tool-oriented (SAS). <strong>KDD</strong> is the classic database view, ending in interpretation/evaluation.</div>

<details class="check"><summary>Check yourself: which framework has a phase dedicated to univariate and multivariate analysis?</summary><div><p>SEMMA, in its <strong>Explore</strong> phase.</p></div></details>
`
        }
    ],
    notes: String.raw`
<h3>1. What is machine learning?</h3>
<p>ML programs computers to learn from data. Samuel (1959): the ability to learn <em>without being explicitly programmed</em>. Mitchell (1997): a program learns from experience <strong>E</strong> on task <strong>T</strong>, measured by performance <strong>P</strong>, if P improves with E. Traditional programming takes rules + data and produces output. ML takes data + desired outcome and produces a learned model.</p>
<p>T should be defined concretely as an ML task. Samples have attributes, called <strong>features</strong>. E is gained by consuming samples, either historical data in one go or fresh samples as they arrive. P is a quantitative metric, evaluated on training data and on unseen validation/test data.</p>

<h3>2. Tasks & when to use ML</h3>
<p>Tasks: <strong>classification</strong> (category), <strong>regression</strong> (real value), <strong>anomaly detection</strong> (unusual patterns in logs), <strong>translation</strong>, <strong>clustering</strong> (latent similarity groups). ML is great for: problems needing lots of hand-tuning or long rule lists; complex problems with no traditional solution; fluctuating environments; and getting insight from large, complex data.</p>

<h3>3. Types of learning</h3>
<ul>
<li><strong>Supervision</strong>: supervised (labelled; classification and regression), unsupervised (unlabelled; clustering), reinforcement (rewards and punishments, trial and error; dog fetching).</li>
<li><strong>Incremental</strong>: batch/offline (all data, trained then deployed without learning) vs online (incremental, mini-batches, fast and cheap; out-of-core learning for huge data).</li>
<li><strong>Generalisation</strong>: instance-based (learn by heart plus a similarity measure) vs model-based (build a model and predict with it).</li>
</ul>

<h3>4. Challenges</h3>
<p>Insufficient data; non-representative data; poor-quality data (outliers, noise, missing values, so <em>garbage in, garbage out</em>); irrelevant features (fix with feature engineering: selection, extraction, new data). <strong>Overfitting</strong>: good on training, poor generalisation, because the model is too complex for the data. Fix by simplifying or constraining the model, adding data, or reducing noise. <strong>Underfitting</strong>: too simple, poor even on training. Fix with a more powerful model, better features, or fewer constraints.</p>

<h3>5. Frameworks</h3>
<ul>
<li><strong>KDD</strong>: Selection → Pre-processing → Transformation → Data Mining → Interpretation/Evaluation.</li>
<li><strong>CRISP-DM</strong>: Business Understanding → Data Understanding → Data Preparation → Modelling → Evaluation → Deployment (iterative).</li>
<li><strong>SEMMA</strong> (SAS Enterprise Miner): Sample → Explore → Modify → Model → Assess.</li>
</ul>
`,
    subjective: [
        { q: 'Define machine learning using Tom Mitchell\'s definition and illustrate T, E and P with a house-price prediction system.', m: 5, a: String.raw`<p><strong>Definition (Mitchell, 1997):</strong> a computer program is said to learn from experience E with respect to some task T and some performance measure P, if its performance on T, as measured by P, improves with experience E.</p><ul><li><strong>T</strong>: predict the selling price of a house (a regression task).</li><li><strong>E</strong>: historical data on past house sales (size, location, rooms → price).</li><li><strong>P</strong>: prediction error, e.g. mean error between predicted and actual prices on unseen houses.</li></ul><p>As the system learns from more appropriate historical data, its prediction error should fall, so P improves with E.</p>` },
        { q: 'Differentiate traditional programming from machine learning. Give one example for each.', m: 4, a: String.raw`<p><strong>Traditional programming</strong>: the programmer writes rules explicitly, and Rules + Data → Output. Example: <code>IF temperature &gt; 30 THEN turn fan ON</code>.</p><p><strong>Machine learning</strong>: the algorithm is given data + desired outcomes and discovers the relationship itself, so Data + Outcome → Learned model. Example: a spam filter learning which email patterns indicate spam from emails users have flagged.</p>` },
        { q: 'Compare and contrast overfitting and underfitting. For each, state its cause and THREE possible solutions.', m: 8, a: String.raw`<p><strong>Overfitting</strong>: the model performs well on training data but does not generalise to new data. <em>Cause</em>: the model is too complex relative to the amount and noisiness of the training data. <em>Solutions</em>: (i) simplify the model with fewer parameters (e.g. linear instead of high-degree polynomial), reduce attributes, or constrain the model (regularisation); (ii) gather more training data; (iii) reduce noise by fixing errors and removing outliers.</p><p><strong>Underfitting</strong>: the model is too simple to learn the underlying structure, so it is inaccurate even on training data. <em>Cause</em>: insufficient model capacity or poor features. <em>Solutions</em>: (i) select a more powerful model with more parameters; (ii) feed better features (feature engineering); (iii) reduce constraints, e.g. lower the regularisation hyperparameter.</p><p><strong>Contrast</strong>: overfitting has low training error and high test error. Underfitting has high error on both.</p>` },
        { q: 'Explain the difference between batch learning and online learning. When would online learning be preferred?', m: 6, a: String.raw`<p><strong>Batch learning</strong> cannot learn incrementally. It must be trained with all available data, which takes time and compute, so it is done offline. It is then launched into production and only applies what it learned. This is offline learning.</p><p><strong>Online learning</strong> trains incrementally by feeding instances sequentially, individually or in mini-batches. Each step is fast and cheap, so the system learns new data on the fly.</p><p><strong>Prefer online</strong> when data arrives continuously and the environment changes (e.g. stock prices), when resources are limited, or when the dataset is too large to fit in memory (out-of-core learning: load part, train, repeat).</p>` },
        { q: 'Describe the six phases of CRISP-DM.', m: 6, a: String.raw`<ol><li><strong>Business understanding</strong>: understand project objectives from a business perspective and convert them to an ML problem definition, a plan and success metrics.</li><li><strong>Data understanding</strong>: collect data, assess relevance, identify data gaps and quality issues, form first insights and hypotheses.</li><li><strong>Data preparation</strong>: clean the data (missing values, gaps), select important features, transform and create new features.</li><li><strong>Modelling</strong>: apply various algorithms to the clean data and tune parameters to optimal values.</li><li><strong>Evaluation</strong>: record and compare model performance against the business criteria; iterate if they are not met.</li><li><strong>Deployment</strong>: implement the signed-off model in production and train users to interpret and use its output.</li></ol>` },
        { q: 'Compare KDD and SEMMA, naming every step of each.', m: 6, a: String.raw`<p><strong>KDD</strong>: Selection (select and integrate target data) → Pre-processing (clean incomplete, noisy, inconsistent data) → Transformation (consolidate into mineable features) → Data Mining (apply ML to extract patterns) → Interpretation/Evaluation (summarise and visualise for users).</p><p><strong>SEMMA</strong> (SAS Enterprise Miner): Sample (select a right-volume subset) → Explore (univariate and multivariate analysis, visualisation) → Modify (clean, derive, transform variables) → Model (apply techniques and benchmark) → Assess (evaluate on unseen test data).</p><p><strong>Comparison</strong>: both cover cleaning, transformation, modelling and evaluation. SEMMA begins by sampling and is tied to a SAS tool. KDD begins with selecting and integrating data from heterogeneous sources. Neither has CRISP-DM's explicit business-understanding or deployment phases.</p>` }
    ],
    mcq: [
        { q: 'Which definition of machine learning is attributed to Arthur Samuel (1959)?', o: ['Learning from experience E with respect to task T and measure P', 'The field of study that gives computers the ability to learn without being explicitly programmed', 'The process of extracting knowledge from databases', 'Programming computers using IF-THEN rules'], a: 1, e: 'Samuel\'s is the general definition. The T-E-P version is Mitchell\'s (1997) engineering-oriented definition.' },
        { q: 'In Mitchell\'s definition for a spam filter, the emails flagged by users are best described as:', o: ['Task T', 'Experience E', 'Performance P', 'The model'], a: 1, e: 'The data the algorithm learns from is the experience E. T is classifying spam, and P is something like accuracy.' },
        { q: 'A model predicts the number of units a product will sell next month. This is:', o: ['Classification', 'Clustering', 'Regression', 'Anomaly detection'], a: 2, e: 'The output is a continuous numeric value, so it is regression.' },
        { q: 'Which is NOT listed in the lecture as a situation where ML is great?', o: ['Problems requiring long lists of hand-tuned rules', 'Fluctuating environments', 'Problems where an exact, simple formula is already known and works perfectly', 'Getting insights from large amounts of data'], a: 2, e: 'If a simple exact rule already works, traditional programming is fine. The other three are the lecture\'s list.' },
        { q: 'A system is trained on all available data, deployed, and does not learn while in production. This is:', o: ['Online learning', 'Batch (offline) learning', 'Reinforcement learning', 'Out-of-core learning'], a: 1, e: 'Batch learning trains on everything at once (offline), then only applies what it learned.' },
        { q: 'Training on a dataset too large for main memory by loading parts and training step by step is called:', o: ['Batch learning', 'Instance-based learning', 'Out-of-core learning', 'Transfer learning'], a: 2, e: 'Out-of-core learning is an application of online learning algorithms.' },
        { q: 'A spam filter that flags emails very similar to known spam emails, using a similarity measure, is an example of:', o: ['Model-based learning', 'Instance-based learning', 'Reinforcement learning', 'Batch learning'], a: 1, e: 'Instance-based learning learns examples by heart and generalises using a similarity measure.' },
        { q: 'A model has 99% training accuracy but 60% test accuracy. The most likely problem is:', o: ['Underfitting', 'Overfitting', 'Insufficient features', 'Data is perfectly representative'], a: 1, e: 'Excellent on training data but poor generalisation is the definition of overfitting.' },
        { q: 'Which is a valid fix for UNDERFITTING?', o: ['Add stronger regularisation', 'Select a more powerful model with more parameters', 'Remove features', 'Use a simpler linear model'], a: 1, e: 'Underfitting means the model is too simple. The other options make the model simpler or more constrained, which fixes overfitting instead.' },
        { q: 'Which is a valid fix for OVERFITTING?', o: ['Reduce the regularisation hyperparameter', 'Use a higher-degree polynomial', 'Gather more training data', 'Add more irrelevant features'], a: 2, e: 'More data, a simpler or constrained model, and less noise all reduce overfitting.' },
        { q: 'Combining existing features to produce a more useful one is called:', o: ['Feature selection', 'Feature extraction', 'Data augmentation', 'Data sampling'], a: 1, e: 'Feature extraction combines existing features (e.g. dimensionality reduction). Selection picks a subset of the existing features.' },
        { q: 'Which is the FIRST phase of CRISP-DM?', o: ['Data Understanding', 'Business Understanding', 'Sample', 'Selection'], a: 1, e: 'CRISP-DM begins with Business Understanding. "Sample" begins SEMMA, and "Selection" begins KDD.' },
        { q: 'Which framework is incorporated in SAS Enterprise Miner?', o: ['KDD', 'CRISP-DM', 'SEMMA', 'Agile'], a: 2, e: 'SEMMA (Sample, Explore, Modify, Model, Assess) was developed by SAS Institute.' },
        { q: 'In KDD, real-world data that is "incomplete, noisy and inconsistent" is dealt with in which step?', o: ['Selection', 'Pre-processing', 'Data Mining', 'Interpretation'], a: 1, e: 'Pre-processing cleans missing values, noise/outliers and discrepancies.' },
        { q: 'In SEMMA, univariate and multivariate analysis take place in which phase?', o: ['Sample', 'Explore', 'Modify', 'Assess'], a: 1, e: 'Explore studies each variable\'s distribution and the relationships between variables, using visualisation.' },
        { q: 'Teaching a dog to fetch by giving treats for success is an analogy for:', o: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Batch learning'], a: 2, e: 'Reinforcement learning works through reward and punishment, learning by trial and error to maximise reward.' },
        { q: 'Training data that does not include examples of some countries leads to a poor life-satisfaction model. This illustrates:', o: ['Overfitting', 'Non-representative training data', 'Too much data', 'Irrelevant features'], a: 1, e: 'Training data must represent the new cases you want to generalise to.' },
        { q: 'Which statement about performance measure P is correct?', o: ['It is evaluated only on training data', 'It is qualitative', 'It is evaluated on training data and on unseen validation/test data', 'It is the same metric for every task'], a: 2, e: 'P is a quantitative metric computed for the specific task T, measured on both seen and unseen data.' }
    ]
});

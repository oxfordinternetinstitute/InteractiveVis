cd /tmp
rm -rf InteractiveVis
git clone git@github.com:oxfordinternetinstitute/InteractiveVis.git
cd InteractiveVis
git checkout --orphan gh-pages
git add .
git commit -a -m "gh-pages auto-commit pages from master"
git push -f origin gh-pages

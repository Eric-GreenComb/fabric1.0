echo "POST query chaincode on peers of Org1 and Org2"
echo
OBJ=$(curl -s -X POST \
  http://localhost:4000/queryObj \
  -H "authorization: Bearer $ORG1_TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"fcn":"queryObj",
	"args":["1001","order"]
}')
echo $OBJ
echo
echo

echo "POST query chaincode on peers of Org1 and Org2"
echo
OBJ=$(curl -s -X POST \
  http://localhost:4000/queryObj \
  -H "authorization: Bearer $ORG1_TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"fcn":"queryObj",
	"args":["1002","order"]
}')
echo $OBJ
echo
echo
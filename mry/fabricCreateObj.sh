echo "POST invoke chaincode on peers of Org1 and Org2"
echo
TRX_ID=$(curl -s -X POST \
  http://localhost:4000/createObj \
  -H "authorization: Bearer $ORG1_TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"fcn":"createObj",
	"args":["1001","order","dGhpcyBpcyBhIHRleHQ="]
}')
echo "Transacton ID is $TRX_ID"
echo
echo

echo "POST invoke chaincode on peers of Org1 and Org2"
echo
TRX_ID=$(curl -s -X POST \
  http://localhost:4000/createObj \
  -H "authorization: Bearer $ORG1_TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"fcn":"createObj",
	"args":["1002","order","dGhpcyBpcyBh"]
}')
echo "Transacton ID is $TRX_ID"
echo
echo
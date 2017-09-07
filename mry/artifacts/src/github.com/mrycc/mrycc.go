/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("mrycc")

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// Init Init
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Info("########### mrycc Init ###########")

	return shim.Success(nil)

}

// Invoke Transaction
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Info("########### mrycc Invoke ###########")

	function, args := stub.GetFunctionAndParameters()

	if function == "createObj" {
		// Deletes an entity from its state
		return t.createObj(stub, args)
	}
	if function == "queryObj" {
		// queries an entity state
		return t.queryObj(stub, args)
	}
	if function == "queryObjs" {
		// queries an entity state
		return t.queryObjs(stub, args)
	}

	logger.Errorf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0])
	return shim.Error(fmt.Sprintf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0]))
}

func (t *SimpleChaincode) createObj(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// must be an invoke
	var _uuid string
	var _type string
	var _base64Obj string
	var err error

	if len(args) != 3 {
		jsonResp := "{\"error\":\"Incorrect number of arguments\"}"
		return shim.Error(jsonResp)
	}
	if args[0] == "" || args[1] == "" || args[2] == "" {
		jsonResp := "{\"error\":\"Arguments is nil\"}"
		return shim.Error(jsonResp)
	}

	_uuid = args[0]
	_type = args[1]
	_base64Obj = args[2]

	// Get the state from the ledger
	_key := t.generateObjKey(_uuid, _type)

	if _avalBytes, err := stub.GetState(_key); err == nil && _avalBytes != nil {
		jsonResp := "{\"error\":\"Obj has existed\"}"
		return shim.Error(jsonResp)
	}

	// Write the state back to the ledger
	err = stub.PutState(_key, []byte(_base64Obj))
	if err != nil {
		jsonResp := "{\"error\":\"PutState error\"}"
		return shim.Error(jsonResp)
	}
	return shim.Success(nil)
}

// generateObjKey Generate ObjKey
func (t *SimpleChaincode) generateObjKey(uuid, objType string) string {
	return fmt.Sprintf("%s_addr_%s", objType, uuid)
}

// Query callback representing the query of a chaincode
func (t *SimpleChaincode) queryObj(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var err error

	if len(args) != 2 {
		jsonResp := "{\"error\":\"Incorrect number of arguments\"}"
		return shim.Error(jsonResp)
	}
	if args[0] == "" || args[1] == "" {
		jsonResp := "{\"error\":\"Arguments is nil\"}"
		return shim.Error(jsonResp)
	}

	_uuid := args[0]
	_type := args[1]

	logger.Info("uuid : " + _uuid)
	logger.Info("type : " + _type)

	_key := t.generateObjKey(_uuid, _type)
	_byte, err := stub.GetState(_key)

	logger.Info("obj : " + string(_byte))

	if err != nil {
		logger.Info("GetState error")
		jsonResp := "{\"error\":\"get state error\"}"
		return shim.Error(jsonResp)
	}
	return shim.Success(_byte)
}

// Query callback representing the query of a chaincode
func (t *SimpleChaincode) queryObjs(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var err error

	if len(args) != 2 {
		jsonResp := "{\"error\":\"Incorrect number of arguments\"}"
		return shim.Error(jsonResp)
	}
	if args[0] == "" || args[1] == "" {
		jsonResp := "{\"error\":\"Arguments is nil\"}"
		return shim.Error(jsonResp)
	}

	_uuids := strings.Split(args[0], ",")
	_types := strings.Split(args[1], ",")

	var objs []string
	if len(_uuids) != len(_types) {
		jsonResp := "{\"error\":\"args is not pair\"}"
		return shim.Error(jsonResp)
	}

	for _index, _uuid := range _uuids {
		_key := t.generateObjKey(_uuid, _types[_index])
		_byte, err := stub.GetState(_key)
		if err != nil {
			objs = append(objs, "")
			continue
		}
		objs = append(objs, string(_byte))
	}

	_json, err := json.Marshal(objs)
	if err != nil {
		jsonResp := "{\"error\":\"json marshal error\"}"
		return shim.Error(jsonResp)
	}
	return shim.Success(_json)
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		logger.Errorf("Error starting Simple chaincode: %s", err)
	}
}
